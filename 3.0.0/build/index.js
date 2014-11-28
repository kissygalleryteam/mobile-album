/*
combined files : 

kg/mobile-album/2.0.0/core/pc-mouse
kg/mobile-album/2.0.0/core/gesture
kg/mobile-album/2.0.0/wakeup-popup/index
kg/mobile-album/2.0.0/index

*/
/**
  * PC 端的功能 剥离到这里来
  */

KISSY.add('kg/mobile-album/2.0.0/core/pc-mouse',function(S, Node, Base){
    var $ = Node.all;

    function PCMouse(config){
        this.box = config.box;
        this.config = config;

        this.livingImg = null || this.box.one('img');

        //touchstart status
        this.touchstartStatus = {
            matrix: [0,0,0,0,0,0,0]
            ,distance: 0
            ,points: new Array()
        }

        //dd action
        this.ddAction = {
            left: false
            ,right: false
            ,top: false
            ,bottom: false
        }
        this.ddPrevPoint = null;

        this.touchType = null;

        if( undefined == S.UA.mobile ){
            this._bindEventPC();
        }
        else{
            this._bindEvent();
        }
        this.test();
    }

    var o = {
        test: function(){

        }

        ,'freeze': function(){

        }
        ,'unfreeze': function(){

        }

        ,initTouchstartStatus: function(){
            var self = this;

            self.livingImg = self.box.one('img');

            self.touchstartStatus.matrix = getMatrix(self.livingImg);
        }

        ,setDDAction: function(begin, end){
            if( begin.left > end.left ){
                this.ddAction.left = true;
                this.ddAction.right = false;
            }
            else if( begin.left < end.left ){
                this.ddAction.left = false;
                this.ddAction.right = true;
            }
            else{
                this.ddAction.left = false;
                this.ddAction.right = false;
            }

            if( begin.top > end.top ){
                this.ddAction.top = true;
                this.ddAction.bottom = false;
            }
            else if( begin.top < end.top ){
                this.ddAction.top = false;
                this.ddAction.bottom = true;
            }
            else{
                this.ddAction.top = false;
                this.ddAction.bottom = false;
            }
        }

        ,_bindEventPC: function(){
            var self = this;

            self.box.on('mousedown', function(e){
                //only left mousedown
                if( e.button != 0 ){
                    return ;
                }
                if( e.target.tagName.toUpperCase() != 'IMG' ){
                    return ;
                }

                self.initTouchstartStatus();

                self.handleMousedown(e);
            })

            self.box.on('mousewheel DOMMouseScroll', self.handleMousewheel, self);
        }
        ,handleMousedown: function(e){
            e.halt();
            var self = this;

            self.moveStartPoint = {
                left: e.pageX
                ,top: e.pageY
            }

            self.ddMouseMask = $('<div style="z-index: 999999;position: fixed;left:0;top:0;width: 2.0.0%;height: 2.0.0%;cursor: move;"></div>');
            self.ddMouseMask.appendTo($(document.body));

            $(document).on('mousemove', self.handleMousemove, self);
            $(document).on('mouseup',   self.handleMouseup,   self);
        }
        ,handleMousemove: function(e){
            e.halt();
            var self = this;

            if( self.isFreeze == true){
                return ;
            }

            var point = {
                left: e.pageX
                ,top: e.pageY
            }

            var d = {
                left: point.left - self.moveStartPoint.left
                ,top: point.top  - self.moveStartPoint.top
            }

            var newMatrix = S.clone(self.touchstartStatus.matrix);
            newMatrix[4] += d.left;
            newMatrix[5] += d.top;
            $(document).fire('dd-mouse', {
                matrix: newMatrix
            })
        }
        ,handleMouseup: function(e){
            var self = this;

            self.ddMouseMask.remove();
            delete self.ddMouseMask;

            $(document).fire('dd-mouse-end');

            $(document).detach('mousemove', self.handleMousemove, self);
            $(document).detach('mouseup',   self.handleMouseup,   self);
        }
        ,handleMousewheel: function(e){
            var self = this;
            if( e.target.tagName.toUpperCase() != 'IMG' ){
                return ;
            }
            e.halt();

            if(self.isFreeze == true){
                return ;
            }
            
            this.initTouchstartStatus();

            var action = '';
            
            if( S.UA.os == 'windows' ){
                if( e.deltaY > 0 ){//放大
                    // action = 'zoom';
                    action = 1.1;
                }
                else if( e.deltaY < 0 ){
                    // action = 'shrunk';
                    action = 0.9;
                }
            }
            else if( /mac/.test(S.UA.os) ){
                //mac
                if( e.deltaY < 0){
                    action = 0 - e.deltaY + 1;
                }
                else if( e.deltaY > 0){
                    action = 1 - e.deltaY;
                }
            }
            else{
                action = 1;
            }
            //落点坐标
            var origin = {
                left: e.clientX - self.touchstartStatus.matrix[4]
                ,top: e.clientY - self.touchstartStatus.matrix[5]
            }
            var newMatrix = self.resetMatrixByScaleAndOrigin(action, origin, self.touchstartStatus.matrix);
            $(document).fire('d_wheel', {
                matrix: newMatrix
            })
        }
        ,resetMatrixByScaleAndOrigin: function(scale, origin, currentMatrix){
            var newMatrix = S.clone(currentMatrix);

            newMatrix[0] = newMatrix[3] = scale * currentMatrix[0];

            newMatrix[4] = -1 * origin.left * (scale-1) + currentMatrix[4];
            newMatrix[5] = -1 * origin.top  * (scale-1) + currentMatrix[5];

            return newMatrix;
        }
    }

    function getMatrix(el, value){
        var transformName = '-webkit-transform';
        if( el.css(transformName) == '' ){
            transformName = 'transform';
        }
        if(el.css(transformName) == ''){
            return [2.0.0,0,2.0.0,0];
        }

        var matrix = el.css(transformName).match(/matrix\((.*)\)/)[1].split(',');
        for(var i = 0; i < matrix.length; ++i){
            matrix[i] = parseFloat(matrix[i]);
        }
        return matrix;
    }

    S.extend(PCMouse, Base, o);

    return PCMouse;

}, {
    requires: ['node', 'base']
})
/**
 * 
 * @authors yumen.gk(yumen.gk@taobao.com\ g.gaokai@gmail.com)
 * @date    2013-12-05
 * @desc    pinch事件 注册机 包含dd
 * @version image-gesture v5
 * @desc   
 * 
 * 使用说明： 该代理工具，仅仅代理<img>的touchstart， touchmove，touchend事件，外部通过监听自定义事件完成 <img>的matrix值的修改
 */

KISSY.add('kg/mobile-album/2.0.0/core/gesture',function(S, Node, Base, PcMouse){
    var $ = Node.all;

    function PinchGesture(config){
        this.box = config.box;
        this.config = config;

        this.config.listIdx = 0;

        this.livingImg = null || this.box.one('img');

        //touchstart status
        this.touchstartStatus = {
            matrix: [0,0,0,0,0,0,0]
            ,distance: 0
            ,points: new Array()
            ,time: 0
        }

        this.boxOffset = {left: 0, top: 0};

        //dd action
        this.ddAction = {
            left: false
            ,right: false
            ,top: false
            ,bottom: false
        }
        this.ddPrevPoint = null;

        this.pinchPrevPoint = new Array(2);

        this.touchType = null;

        if( undefined == S.UA.mobile ){
            new PcMouse(config);
        }
        else{
            this._bindEvent();
        }
        this.test(); 
    }

    var o = {
        test: function(){

        }

        ,'setBoxOffset': function(offset){
            this.boxOffset = offset;
        }

        ,'freeze': function(){

        }
        ,'unfreeze': function(){

        }

        ,initTouchstartStatus: function(){
            var self = this;

            self.livingImg = self.box.all('img').item(self.config.listIdx);

            self.touchstartStatus.matrix = getMatrix(self.livingImg);
        }

        ,_bindEvent: function(){
            var self = this;
            self.box.on('touchstart', function(e){
                if( e.target.tagName.toUpperCase() != 'IMG' ){
                    return;
                }
                if( e.touches && e.touches.length == 1 ){
                    self.box.fire('touchend', e);
                    self.touchType = 'dd';
                    self.handleDDStart(e);
                }

                else if( e.touches && e.touches.length == 2 ){
                    $(document).fire('touchend', e);
                    self.touchType = 'pinch';
                    self.handlePinchStart(e);
                }
            })

            //touched 兜底
            //help for pinch-end
            self.box.on('touchend', function(e){
                if( self.touchType == 'pinch' ){
                    self.handlePinchEnd(e);
                }
                else if( self.touchType == 'dd' ){
                    ;
                }
            })
        }

        ,handleDDStart: function(e){
            e.halt();
            var self = this;
            self.initTouchstartStatus();

            var points = new Array(2);
            points[0] = {
                left: e.touches[0].pageX
                ,top: e.touches[0].pageY
            }

            self.touchstartStatus.points = points;
            self.touchstartStatus.time = 0;

            self.ddPrevPoint = points[0];
            self.fire('dd-start', {
                matrix: self.touchstartStatus.matrix
            });
            self.box.on('touchmove', self.handleDDIng, self);
            self.box.on('touchend',   self.handleDDEnd, self);
        }
        ,handleDDIng: function(e){
            if( ! (e.touches && e.touches.length == 1) ){
                return ;
            }
            e.halt();
            var self = this;
            if( self.touchType == 'pinch' ){
                return ;
            }

            var points = new Array(2);
            points[0] = {
                left: e.touches[0].pageX
                ,top: e.touches[0].pageY
            }

            var d = {
                left: points[0].left - self.touchstartStatus.points[0].left
                ,top: points[0].top  - self.touchstartStatus.points[0].top
            }

            var newMatrix = S.clone(self.touchstartStatus.matrix);
            newMatrix[4] += d.left;
            newMatrix[5] += d.top;

            self.fire('dding', {
                matrix: newMatrix
                ,d: d
                ,interval_d: {
                    left: points[0].left - self.ddPrevPoint.left
                    ,top: points[0].top - self.ddPrevPoint.top
                }
            })

            self.ddPrevPoint = points[0];
        }
        ,handleDDEnd: function(e){
            var self = this;
            self.box.detach('touchmove', self.handleDDIng, self);
            self.box.detach('touchend',   self.handleDDEnd, self);   
            if( self.touchType != 'dd' ){
                return false;
            }
            self.touchType = null;
            self.fire('dd-end');

            // if( e.touches[0].pageX == self.touchstartStatus.points[0].left && e.touches[0].pageY == self.touchstartStatus.points[0].top ){
            //     self.fire('liketap');
            // }
        }

        ,handlePinchStart: function(e){
            e.halt();
            var self = this;
            self.fire('pinch-start');
            
            self.initTouchstartStatus();
            //图片真实可见内容的左上角 偏移量 值
            var points = new Array(2);
            for(var i = 0; i < e.touches.length; ++i){
                points[i] = {
                    left: e.touches[i].pageX - self.touchstartStatus.matrix[4] - self.boxOffset.left,
                    top:  e.touches[i].pageY - self.touchstartStatus.matrix[5] - self.boxOffset.top
                };
            }
            self.touchstartStatus.points = points;
            self.touchstartStatus.distance = getTwopointDistance(points);

            self.pinchPrevPoint = points;

            $(document).on('touchmove', self.handlePinching, self);
            $(document).on('touchend',  self.handlePinchEnd, self);
        }
        ,handlePinching: function(e){
            var self = this;
            if( self.touchType != 'pinch' ){
                return ;
            }
            if( !(e.touches && e.touches.length == 2) ){
                return ;
            }

            e.halt();

            //图片真实可见内容的左上角 偏移量 值
            var points = new Array(2);
            for(var i = 0; i < e.touches.length; ++i){
                points[i] = {
                    left: e.touches[i].pageX - self.touchstartStatus.matrix[4] - self.boxOffset.left,
                    top:  e.touches[i].pageY - self.touchstartStatus.matrix[5] - self.boxOffset.top
                };
            }

            // var vector0 = getVector(points[0], self.pinchPrevPoint[0]);
            // var vector1 = getVector(points[1], self.pinchPrevPoint[1]);

            // console.log(S.JSON.stringify(vector0));
            // console.log(S.JSON.stringify(vector1));

            



            var distance_a0tob1 = getTwopointDistance([self.touchstartStatus.points[0], points[1]]);

            var distance_a1tob1 = getTwopointDistance(points);

            var scale_b_0to1 = distance_a0tob1 / self.touchstartStatus.distance;
            var scale_a_0to1 = distance_a1tob1 / distance_a0tob1;

            var newMatrix0 = self.pinchForOnePointMove(self.touchstartStatus.points[1], points[1], scale_b_0to1, self.touchstartStatus.matrix);

            // console.log(scale_b_0to1, scale_a_0to1)
            var newMatrix1 = self.pinchForOnePointMove(self.touchstartStatus.points[0], points[0], scale_a_0to1, newMatrix0);

            // newMatrix1[4] -= self.boxOffset.left;
            // newMatrix1[5] -= self.boxOffset.top;

            self.fire('pinching', {
                matrix: newMatrix1
            })

            self.pinchPrevPoint = points;

        }
        ,handlePinchEnd: function(e){
            var self = this;
            if( e.touches && e.touches.length == 0 ){
                self.touchType = null;
                $(document).detach('touchmove', self.handlePinching, self);
                $(document).detach('touchend',  self.handlePinchEnd, self);
                self.fire('pinch-end');
            }
        }

        ,pinchForOnePointMove: function(beginPoint, endPoint, scale, matrix){
            var self = this;

            var newMatrix = [0,0,0,0,0,0];
            newMatrix[0] = newMatrix[3] = matrix[0] * scale;

            newMatrix[4] = parseInt( matrix[4] - beginPoint.left * scale + endPoint.left);
            newMatrix[5] = parseInt( matrix[5] - beginPoint.top  * scale + endPoint.top);

            return newMatrix;
        }
    }

    function getMatrix(el, value){
        var transformName = '-webkit-transform';
        if( el.css(transformName) == '' ){
            transformName = 'transform';
        }
        if(el.css(transformName) == ''){
            return [2.0.0,0,2.0.0,0];
        }

        var matrix = el.css(transformName).match(/matrix\((.*)\)/)[1].split(',');
        for(var i = 0; i < matrix.length; ++i){
            matrix[i] = parseFloat(matrix[i]);
        }
        return matrix;
    }

    //两点绝对距离  sqrt( x1-x2)^2 + (y1-y2)^2 )
    function getTwopointDistance(points){
        var p1 = points[0], p2 = points[1];
        return Math.sqrt( (p1.left-p2.left)*(p1.left-p2.left) + (p1.top - p2.top)*(p1.top - p2.top) );
    }

    // function getVector(p1,p2){
    //     var vector = {
    //         left: p2.left - p1.left
    //         ,top: p2.top  - p1.top
    //     };

    //     return vector;
    // }

    S.extend(PinchGesture, Base, o);

    return PinchGesture;
},{
    requires: ['node', 'base', './pc-mouse']
});

/**
 * 
 * @authors yumen.gk (yumen.gk@taobao.com | g.gaokai@gmail.com)
 * @date    2013-12-09 17:50:42
 * @version 2
 * @desc    唤醒fixed模块时，如果同时唤醒了手机键盘，iphone及其部分android浏览器 fixed 定位会失效，  这里采用监听 touchend事件，还原scroll定位，实现fixed相对位置不变
 * 
 */

KISSY.add('kg/mobile-album/2.0.0/wakeup-popup/index',function(S, Node, Base){
    var $ = Node.all;

    function WakeupPopup(config){
        this.msgPanelHelp = {
            curScrollTop: 0,
            timeout: null
        }

        this.isLive = false;
    }

    var o = {
        'wakeup': function(){
            if( this.isLive == true ){
                return ;
            }
            this.isLive = true;
            this.wakeupMsgPanel();
            this.msgPanelTouchend();
        }
        ,'sleep': function(){
            this.isLive = false;
            this.sleepMsgPanel();
        }

        ,wakeupMsgPanel: function(){
            var self = this;
            self.msgPanelHelp.curScrollTop = document.body.scrollTop;
            document.body.scrollTop = 0;
            $(document).on('touchstart', self.msgPanelTouchstart, self);
        }
        ,msgPanelTouchstart: function(){
            var self = this;
            $(document).on('touchend', self.msgPanelTouchend, self);
        }
        ,msgPanelTouchend: function(){
            var self = this;
            self.msgPanelHelp.timeout && clearTimeout(self.msgPanelHelp);
            self.msgPanelHelp.timeout = setTimeout(function(){
                document.body.scrollTop = 0;
            },2.0.0);
        }
        ,sleepMsgPanel: function(){
            var self = this;
            setTimeout(function(){
                document.body.scrollTop = self.msgPanelHelp.curScrollTop;
            }, 2.0.0);
            $(document).detach('touchstart', self.msgPanelTouchstart, self);
            $(document).detach('touchend',   self.msgPanelTouchend,   self);
        }
    }

    S.extend(WakeupPopup, Base, o);

    return WakeupPopup;
},{
    requires: ['node', 'base']
})


/**
 * 
 * @authors yumen.gk(yumen.gk@taobao.com | g.gaokai@gmail.com)
 * @date    2014-1-3 16:55:26
 * @version 3
 * @desc    mobile album || pinch功能适配器
 */

KISSY.add('kg/mobile-album/2.0.0/index',function(S, Base, Gesture, WakeupPopup){
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
                }, 500 + 2.0.0);
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

            var boxMatrix = [2.0.0,0,2.0.0,0];
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
                    }, 500 + 2.0.0);
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

            
            var matrix = [2.0.0,0,2.0.0,0];
            matrix[4] = self.albumRange.width * index * 1.2;

            var width = '', height = '', left = 0, top = 0;
            if( size.width / size.height >= self.albumRange.width / self.albumRange.height ){
                width = '2.0.0%';
                top = ( self.albumRange.height - size.height * self.albumRange.width / size.width ) / 2;
            }
            else{
                height = '2.0.0%';
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

            var boxMatrix = [2.0.0,0,2.0.0,0];
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

            var boxMatrix = [2.0.0,0,2.0.0,0];
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
            return [2.0.0,0,2.0.0,0];
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
