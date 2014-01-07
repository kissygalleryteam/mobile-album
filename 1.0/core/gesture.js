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

KISSY.add(function(S, Node, Base, PcMouse){
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
            return [1,0,0,1,0,0];
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
