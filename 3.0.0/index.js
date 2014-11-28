/**
 * 
 * @authors yumen.gk(yumen.gk@taobao.com | g.gaokai@gmail.com)
 * @date    2014-1-3 16:55:26
 * @version 3
 * @desc    mobile album || pinch功能适配器
 */

KISSY.add(function(S, Base, Gesture, WakeupPopup){
    var $ = S.all;

    function MAlbum(config){
        var self = this;

        var config = config || {box: $('#J_PinchBox'), boxWrap: $('#J_PinchBoxWrap')};
        self.box = config.box;
        self.boxWrap = config.boxWrap;
        self.config = config;

        self.albumRange = {
            width: document.documentElement.clientWidth
            ,height: document.documentElement.clientHeight
        }

        self.albumInfo = {
            data: config.data || []
            ,idx: config.cIdx || 0
            ,albumItems: []
        }

        //focusImg info
        self.focusItemInfo = {
            img: null
            ,overflowRange: {
                initTop: 0
                ,initLeft: 0
            }
        }

        self.showingBorders = {
            left: 0
            ,right: 0
        }

        self.boxBeginMatrix = new Array(6);
        self.imgBeginMatrix = new Array(6);

        self.gesture = new Gesture(config);

        self.wakeupPopup = new WakeupPopup();

        self.bindEvent();
    }

    var o = {
        'hide': function(){
            var self = this;
            self.boxWrap.hide();
            self.box.html('');
            self.wakeupPopup.sleep();
        }
        ,'data': function(data){
            this.albumInfo.data = data;
        }
        ,'init': function(){
            var self = this;
            self.boxWrap.show();
            self.fire('show');

            self.initAlbumPanel();
            self.wakeupPopup.wakeup();
        }

        ,'setIndex': function(idx){
            this.albumInfo.idx = idx;
        }

        ,initFocusItemInfo: function(){
            var self = this;

            self.focusItemInfo.img = self.box.all('img').item(self.albumInfo.idx);
        }

        ,bindEvent: function(){
            var self = this;
            //
            var _timeout = null;
            var _actionTimeout = null;

            self.gesture.on('pinch-start',function(e){
                var boxMatrix = getMatrix(self.box);
                self.gesture.setBoxOffset({
                    left: boxMatrix[4]
                    ,top: boxMatrix[5]
                })
                self.initFocusItemInfo();

                _timeout && clearTimeout(_timeout);
                self.box.removeClass('img-slide');
            }).on('pinching', function(e){
                var target = self.albumInfo.albumItems[self.albumInfo.idx];
                var boxMatrix = getMatrix(self.box);

                self.box.removeClass('img-slide');
                target.css('-webkit-transform', 'matrix( ' + e.matrix.join(',') + ' )');
            }).on('pinch-end', function(){
                var target = self.albumInfo.albumItems[self.albumInfo.idx];
                self.box.addClass('img-slide');

                _timeout && clearTimeout(_timeout);
                _timeout = setTimeout(function(){
                    self.box.removeClass('img-slide');
                }, 500);

                var matrix = getMatrix(target);
                var boxMatrix = getMatrix(self.box);

                var ret = self.slideToRange2(boxMatrix, matrix);

                target.css('-webkit-transform', 'matrix( ' + ret.matrix.join(',') + ')');
                self.box.css('-webkit-transform', 'matrix(' + ret.boxMatrix.join(',') + ')');

                setTimeout(function(){
                    self.gesture.fire('dd-end', {
                        noReplace: true
                    });
                }, 500 + 100);
                console.log('pinch-end')
            })

            //
            self.gesture.on('dd-start', function(e){
                self.initFocusItemInfo();
                self.boxBeginMatrix = getMatrix(self.box);
                self.imgBeginMatrix = e.matrix;
                self.box.removeClass('anim').removeClass('img-slide');
            }).on('dding', function(e){
                var target = self.albumInfo.albumItems[self.albumInfo.idx];

                var matrix = getMatrix(target);
                var boxMatrix = getMatrix(self.box);

                //x 轴运动
                if( (self.albumInfo.idx == 0 && e.d.left > 0) 
                    || self.albumInfo.idx == self.albumInfo.albumItems.length - 1 && e.d.left < 0 ){
                    boxMatrix[4] = self.boxBeginMatrix[4] + e.d.left / 2;
                }
                else{
                    boxMatrix[4] = self.boxBeginMatrix[4] + e.d.left;
                }

                //y轴运动
                if( matrix[0] > 1 ){
                    matrix[5] = self.imgBeginMatrix[5] + e.d.top;
                }

                self.box.css('-webkit-transform', 'matrix( ' + boxMatrix.join(',') + ' )');
                target.css('-webkit-transform', 'matrix(' + matrix.join(',') + ')');
            }).on('dd-end', function(e){
                self.box.addClass('anim').addClass('img-slide');
                _timeout = setTimeout(function(){
                    self.box.removeClass('anim').removeClass('img-slide');
                }, 500);

                var target = self.albumInfo.albumItems[self.albumInfo.idx];

                var matrix = getMatrix(target);
                var boxMatrix = getMatrix(self.box);

                var d_4 = boxMatrix[4] - self.boxBeginMatrix[4];

                if( e.noReplace === true ){
                    ;
                }
                else if( self.needReplaceShowingImg(d_4, matrix) ){
                    return ;
                }
                var ret = self.slideToRange(boxMatrix, matrix);

                target.css('-webkit-transform', 'matrix(' + ret.matrix.join(',') + ')');
                self.box.css('-webkit-transform', 'matrix(' + ret.boxMatrix.join(',') +')');
                console.log('dd-end')
            })

            $(document).on('dd-mouse d_wheel', function(e){
                self.target = self.box.all('img').item(self.albumInfo.idx);
                self.target.css('-webkit-transition', 'none');
                self.target.css('-webkit-transform', 'matrix( ' + e.matrix.join(',') + ' )');
                // self.offsetWaitingImg(e.matrix);
            })
        }

        ,initAlbumPanel: function(){
            var self = this;
            
            self.setTrigger();

            //render all album images with mini size
            self.renderImages();

            self.gesture.config.listIdx = self.albumInfo.idx;
        }
        ,setTrigger: function(){
            var self = this;
            //init triggers
            if( self.albumInfo.data.length > 1 ){
                self.boxWrap.one('.J_SlidePinchTrigger').html(new Array(self.albumInfo.data.length + 1).join('*').replace(/\*/g, '<li></li>'));
                
                self.boxWrap.one('.J_SlidePinchTrigger').children('li').item(self.albumInfo.idx).addClass('current');
            }
            else{
                self.boxWrap.one('.J_SlidePinchTrigger').html('');
            }
        }
        ,renderImages: function(){
            var self = this;
            var data = self.albumInfo.data;
            var idx = self.albumInfo.idx;
            self.albumInfo.albumItems = [];
            for(var i = 0; i < data.length; ++i){
                var albumItem = $('<img src="' + data[i].miniSrc + '"/>');

                self.albumInfo.albumItems.push(albumItem);

                self.box.append(albumItem);

                self.imageAdapterRange(i, albumItem, false);

                if( i == self.albumInfo.idx ){
                    self.imageAdapterRange(i, albumItem, true);
                }
            }

            var boxMatrix = [1,0,0,1,0,0];
            boxMatrix[4] = 0 - idx * self.albumRange.width * 1.2;
            self.box.css('-webkit-transform', 'matrix(' + boxMatrix.join(',') + ')');
        }

        //根据领域偏移  设置非活跃图片的偏移
        ,offsetAlbumImages: function(){
            var self = this;
            var data = self.albumInfo.data;
            var idx =  self.albumInfo.idx;

            for(var i = 0; i < data.length; ++i){
                if( i != idx){
                    self.imageAdapterRange(i, self.albumInfo.albumItems[i], false);
                }
                else{
                    self.imageAdapterRange(i, self.albumInfo.albumItems[i], true);
                }
            }
        }

        //=== common
        ,imageAdapterRange: function(index, albumItem, afterOnload){
            var self = this;
            var data = self.albumInfo.data;

            if( afterOnload === true && albumItem.attr('data-origin-loaded') !== 'true' ){
                var imgObj = new Image();
                
                imgObj.onload = function(){
                    albumItem.attr('src', data[index].originSrc).attr('data-origin-loaded', 'true');
                    setTimeout(function(){
                        self.resetImagePosition({
                            width: albumItem.prop('offsetWidth')
                            ,height: albumItem.prop('offsetHeight')
                        }, albumItem, index);
                    }, 500 + 100);
                }
                imgObj.src = data[index].originSrc;
            }
            self.resetImagePosition({
                width: data[index].size.width
                ,height: data[index].size.height
            }, albumItem, index);

        }

        ,resetImagePosition: function(size, albumItem, index){
            var self = this;

            
            var matrix = [1,0,0,1,0,0];
            matrix[4] = self.albumRange.width * index * 1.2;

            var width = '', height = '', left = 0, top = 0;
            if( size.width / size.height >= self.albumRange.width / self.albumRange.height ){
                width = '100%';
                top = ( self.albumRange.height - size.height * self.albumRange.width / size.width ) / 2;
            }
            else{
                height = '100%';
                left = ( self.albumRange.width - size.width * self.albumRange.height / size.height ) / 2;
            }

            //领域扩张 偏移判断
            if( index < self.albumInfo.idx ){
                matrix[4] += left - Math.abs(self.showingBorders.left);
            }
            else if( index > self.albumInfo.idx ){
                matrix[4] += left + Math.abs(self.showingBorders.right);
            }
            else{
                matrix[4] += left;
            }

            if( self.showingBorders.left != 0 || self.showingBorders.right != 0 ){
                var boxMatrix = getMatrix(self.box);
                matrix[4] += 0 - boxMatrix[4] - self.albumRange.width * self.albumInfo.idx * 1.2;
            }
            matrix[5] += top;

            albumItem.css('width', width).css('height', height).css('-webkit-transform', 'matrix(' + matrix.join(',') + ')');

            self.albumInfo.data[index].coo = {
                left: left
                ,top: top
            }

            self.albumInfo.data[index].size = size;

            self.albumInfo.data[index].initPos = {
                left: left
                ,top: top
            }
        }

        //back
        
        ,needReplaceShowingImg: function(d_4, matrix){
            var self = this;
            if( self.albumInfo.albumItems.length <= 1 ){
                return false;
            }

            var docw = self.albumRange.width;

            if( Math.abs(d_4) < docw / 2){
                return false;
            }

            var offsetLeft = self.albumRange.width * 1.2 * self.albumInfo.idx;

            var target =    self.albumInfo.albumItems[self.albumInfo.idx];
            var targetData = self.albumInfo.data[self.albumInfo.idx];
            var boxMatrix = getMatrix(self.box);
            var matrix_4 =  boxMatrix[4] + offsetLeft;
            var size =   self.albumInfo.data[self.albumInfo.idx].size;
            // console.log(targetData.size.width * matrix[0] + boxMatrix[4] - matrix[4])
            // var img = target[0];
            if( matrix_4 - self.showingBorders.left  >= docw / 2 ){
                // console.log('prev');
                if( self.albumInfo.idx - 1 < 0 ){
                    return false;
                }
                self._prev();
                return true;
            }
            // else if( 0 - matrix_4 - self.showingBorders.right - targetData.initPos.left + docw - size.width*matrix[0] / 2 >= docw / 2  ){
            else if( targetData.size.width * matrix[0] + matrix[4] + boxMatrix[4] - 2 * offsetLeft <= docw / 2  ){
                if( self.albumInfo.idx + 1 >= self.albumInfo.data.length ){
                    return false;
                }
                self._next();
                return true;
            }
            return false;
        }

        ,_prev: function(){
            var self = this;
            --self.albumInfo.idx;
            if( self.albumInfo.idx < 0 ){
                self.albumInfo.idx = self.albumInfo.data.length - 1;
            }

            var boxMatrix = [1,0,0,1,0,0];
            boxMatrix[4] = 0 - self.albumInfo.idx * self.albumRange.width * 1.2;
            self.box.css('-webkit-transform', 'matrix(' + boxMatrix.join(',') + ')');

            // self.imageAdapterRange(self.albumInfo.idx, self.albumInfo.albumItems[self.albumInfo.idx], true);
            self.setTrigger();
            self.gesture.config.listIdx = self.albumInfo.idx;

            self.devideBorders({left: 0, right: 0});


        }
        ,_next: function(){
            var self = this;
            ++self.albumInfo.idx;
            if( self.albumInfo.idx >= self.albumInfo.data.length ){
                self.albumInfo.idx = 0;
            }

            var boxMatrix = [1,0,0,1,0,0];
            boxMatrix[4] = 0 - self.albumInfo.idx * self.albumRange.width * 1.2;
            self.box.css('-webkit-transform', 'matrix(' + boxMatrix.join(',') + ')');
            
            // self.imageAdapterRange(self.albumInfo.idx, self.albumInfo.albumItems[self.albumInfo.idx], true);
            self.setTrigger();
            self.gesture.config.listIdx = self.albumInfo.idx;

            self.devideBorders({left: 0, right: 0});
        }

        //for dd only control box position
        ,slideToRange: function(boxMatrix, matrix){
            var self = this;
            var target = self.albumInfo.albumItems[self.albumInfo.idx];
            var targetData  = self.albumInfo.data[self.albumInfo.idx];

            var offsetLeft = self.albumRange.width * self.albumInfo.idx * 1.2;

            //x 轴 弹回
            if( targetData.size.width * matrix[0] <= self.albumRange.width){
                boxMatrix[4] = 0 - self.albumInfo.idx * self.albumRange.width * 1.2;
                matrix[0] = matrix[3] = 1;
                matrix[4] = offsetLeft + targetData.coo.left;
                matrix[5] = targetData.coo.top;
            }
            else{
                //左 内溢出
                if( matrix[4] + boxMatrix[4] > 0 ){
                    boxMatrix[4] = 0 - matrix[4];
                }
                //右 内溢出
                else if( targetData.size.width * matrix[0] + matrix[4] + boxMatrix[4] < self.albumRange.width ){
                    // boxMatrix[4] = 0;
                    boxMatrix[4] = self.albumRange.width - targetData.size.width * matrix[0] - matrix[4];
                    // matrix[4] = offsetLeft - targetData.size.width * matrix[0] + self.albumRange.width;
                }
            }

            //y轴 弹回
            if( targetData.size.height * matrix[0] <= self.albumRange.height ){
                matrix[5] = (self.albumRange.height - targetData.size.height * matrix[0]) / 2;
                
            }
            else{
                //上 内溢出
                if( matrix[5] > 0 ){
                    matrix[5] = 0;
                }
                //下 内溢出
                else if( matrix[5] < self.albumRange.height - targetData.size.height * matrix[0] ){
                    matrix[5] = self.albumRange.height - targetData.size.height * matrix[0];
                }
            }

            return {
                boxMatrix: boxMatrix
                ,matrix: matrix
            };
        }

        //for pinch 注意起始状态 box 偏移 不一定在标线上
        ,slideToRange2: function(boxMatrix, matrix){
            var self = this;
            var target = self.albumInfo.albumItems[self.albumInfo.idx];
            var targetData  = self.albumInfo.data[self.albumInfo.idx];

            var offsetLeft = self.albumRange.width * self.albumInfo.idx * 1.2

            var borders = {left: 0, right: 0};

            if( matrix[0] < 1 ){
                matrix[0] = matrix[3] = 1;
                matrix[4] = offsetLeft + targetData.coo.left;
                matrix[5] = targetData.coo.top;
                // boxMatrix[4] = 0 - self.albumInfo.idx * self.albumRange.width * 1.2;

            }
            else if(matrix[0] * targetData.size.width <= self.albumRange.width){
                //居中
                matrix[4] = 0 - (matrix[0]-1) * targetData.size.width  / 2 + offsetLeft + targetData.coo.left;
            }
            else if(matrix[0] * targetData.size.width > self.albumRange.width){
                //左 内溢出
                if( matrix[4] + boxMatrix[4] > 0 ){
                    matrix[4] = 0 - boxMatrix[4];
                    // boxMatrix[4] = 0 - offsetLeft;
                    //右领域扩张
                    // borders = {
                    //     left: 0
                    //     ,right: matrix[0] * targetData.size.width - self.albumRange.width
                    // };
                }
                //右 内溢出
                else if( matrix[4] + boxMatrix[4] < self.albumRange.width - targetData.size.width * matrix[0]  ){
                    // boxMatrix[4] = offsetLeft;
                    matrix[4] = self.albumRange.width - targetData.size.width * matrix[0] - boxMatrix[4];
                    // matrix[4] = offsetLeft + self.albumRange.width - targetData.size.width * matrix[0];
                    //左领域扩张
                    // borders = {
                    //     left: matrix[0] * targetData.size.width - self.albumRange.width
                    //     ,right: 0
                    // };
                }
                borders = {
                    left: Math.abs(matrix[4] + boxMatrix[4])
                    ,right: Math.abs(matrix[0] * targetData.size.width - self.albumRange.width - Math.abs(boxMatrix[4] + matrix[4]) )
                    // ,right: Math.abs(matrix[0] * targetData.size.width - self.albumRange.width - boxMatrix[4] + matrix[4])
                };
            }

            self.devideBorders(borders);

            return {
                boxMatrix: boxMatrix
                ,matrix:   matrix
            };
        }

        ,devideBorders: function(borders){
            var self = this;
            self.showingBorders = borders;

            self.offsetAlbumImages();
        }
    }

    function getMatrix(el, value){
        var transformName = '-webkit-transform';
        if( el.css(transformName) == '' ){
            transformName = 'transform';
        }
        if(el.css(transformName) == ''){
            return [1,0,0,1,0,0];
        }

        var matrix = el.css(transformName).match(/matrix\((.*)\)/)[1].split(',');
        for(var i = 0; i < matrix.length; ++i){
            matrix[i] = parseFloat(matrix[i]);
        }
        return matrix;
    }

    S.extend( MAlbum, Base, o);

    return MAlbum;
}, {
    requires: ['base', './core/gesture', './wakeup-popup/index', './assets/mobile-album.css']
})