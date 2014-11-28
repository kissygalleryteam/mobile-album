/**
  * PC 端的功能 剥离到这里来
  */

KISSY.add(function(S, Node, Base){
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