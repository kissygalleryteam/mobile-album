/**
  * yumen.gk 2014-10-27 20:45
  * 双点跟随
  */

KISSY.add(function(S, Base, UA, Node, Tools){
  var $ = Node.all;

  function Fingers(cfg){
    Fingers.superclass.constructor.call(this, cfg);
  }

  var ATTRS = {
    box: {value: null}
    ,elTrigger: {value: ''}
    ,elOriginSize: {
      value: {width: 0, height: 0}
    }

    ,maxScale: {value: 3}

    ,clientWidth: {value: 0}
    ,clientHeight: {value: 0}
    ,elOffset: {
      value: {
        x: 0
        ,y: 0
      }
    }
    ,startPoint: {
      value: [{x:0, y:0}, {x:0, y:0}]
    }

    ,cacheTransform: {
      value: {scale: 1, offset: {x: 0, y: 0}}
    }
    ,prevTransform: {
      value: {scale: 1, offset: {x: 0, y: 0}}
    }
  }

  var o = {
    initializer: function(){
      this._event();
    }

    ,_event: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');

      box.delegate('gesturestart', elTrigger, this._gesturestart, this);

      box.delegate('touchstart', elTrigger, this._touchstart, this);
      box.delegate('touchmove', elTrigger, this._touchmove, this);
      box.delegate('touchend', elTrigger, this._toucheend, this);
    }

    ,_prepare: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var img = el;
      if( el.prop('tagName').toUpperCase() != 'IMG' ){
        img = el.all('img');
      }
      this.set('elOriginSize', {
        width: img.prop('offsetWidth')
        ,height: img.prop('offsetHeight')
        ,offset: {
          x: 0
          ,y: 0
        }
      });
      this.set('elOffset', {
        left: img.prop('offsetLeft')
        ,top: img.prop('offsetTop')
      })

      this.set('clientWidth', document.documentElement.clientWidth);
      this.set('clientHeight', document.documentElement.clientHeight);

      this.set('cacheTransform', el.data('transform') || {scale: 1, offset: {x: 0, y: 0}});
      this.set('prevTransform', el.data('transform') || {scale: 1, offset: {x: 0, y: 0}});
    }

    ,_gesturestart: function(e){
      var box = this.get('box')
      elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      this._prepare();
      box.delegate('gesturechange', elTrigger, this._gesturechange, this);
      box.delegate('gestureend', elTrigger, this._gestureend, this);

      // 添加品尝动画效果
      el.removeClass('transition_back');
      el.addClass('transition_pinch');
    }
    ,_gesturechange: function(e){
    }
    ,_gestureend: function(e){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      // slideTo_slideline
      var transform = Tools.setCloseTo_slideline(el, this.get('elOriginSize'), this.get('elOffset'), this.get('prevTransform'));
      
      this.set('cacheTransform', this.get('prevTransform'));
      this.set('prevTransform', transform);
      this.update(300);

      box.undelegate('gesturechange', elTrigger, this._gesturechange, this);
      box.undelegate('gestureend', elTrigger, this._gestureend, this);

      // 去除pinch动画效果
      el.removeClass('transition_pinch');
    }

    ,_touchstart: function(e){
      if( e.touches.length != 2 ){
        return ;
      }
      if( UA.mobile != 'apple' ){
        this._gesturestart();
      }

      var currPoint = [{
        x: e.touches[0].clientX
        ,y: e.touches[0].clientY
      }, {
        x: e.touches[1].clientX
        ,y: e.touches[1].clientY
      }];

      this.set('startPoint', currPoint);


    }
    ,_touchmove: function(e){
      if( e.touches.length != 2 ){
        return ;
      }
      var currPoint = [{
        x: e.touches[0].clientX
        ,y: e.touches[0].clientY
      }, {
        x: e.touches[1].clientX
        ,y: e.touches[1].clientY
      }];

      var start_centerPoint = getCenterPoint(this.get('startPoint'));
      var curr_centerPoint = getCenterPoint(currPoint);

      var offset = {
        x: curr_centerPoint.x - start_centerPoint.x
        ,y: curr_centerPoint.y - start_centerPoint.y
      };

      var scale = distance_twopoints(currPoint) / distance_twopoints(this.get('startPoint'))
      ,point = start_centerPoint
      ,offset = offset;
      var prevTransform = this.get('prevTransform');

      prevTransform = Tools.setScaleByOrigin(scale, prevTransform, point);

      prevTransform.offset = {
        x: prevTransform.offset.x + offset.x
        ,y: prevTransform.offset.y + offset.y
      }

      this.set('cacheTransform', this.get('prevTransform'));
      this.set('prevTransform', prevTransform);

      this.set('startPoint', currPoint);

      this.update();
    }
    ,_toucheend: function(e){
      if(UA.mobile != 'apple'){
        this._gestureend();
      }
    }

    ,update: function(timer){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var prevTransform = this.get('prevTransform');
      if( prevTransform.scale >= this.get('maxScale') ){
          prevTransform = this.get('cacheTransform');
          this.set('prevTransform', this.get('cacheTransform'));
      }

      Tools.setTransform(el, prevTransform, timer, 'pinch');

      el.data('tranform', prevTransform);
    }
  };

  function getCenterPoint(points){
    return {
      x: (points[1].x + points[0].x) / 2
      ,y: (points[1].y + points[0].y) / 2
    }
  }

  function distance_twopoints(points){
    return Math.abs( (points[1].x - points[0].x) * (points[1].x - points[0].x) + (points[1].y - points[0].y) * (points[1].y - points[0].y) );
  }

  function calculatePinch(point, scale){

  }

  S.extend(Fingers, Base, o, {
    ATTRS: ATTRS
  });

  return Fingers;
}, {
  requires: ['base', 'ua', 'node', './tools']
})