/*
combined files : 

kg/mobile-album/3.0.0/tools
kg/mobile-album/3.0.0/onefinger
kg/mobile-album/3.0.0/twofinger
kg/mobile-album/3.0.0/slide
kg/mobile-album/3.0.0/album

*/
/**
  * mobile album tools
  */

KISSY.add('kg/mobile-album/3.0.0/tools',function(S){
  var Tools = {
    // 根据图片当前偏移量，获取溢出容器的偏移量；  todo: 融合单轴滑动 处理和判断
    getBoxOffsetIfOverflow: function(startTransform, elOriginSize, offset){
      var clientWidth = document.documentElement.clientWidth;
      var clientHeight = document.documentElement.clientHeight;

      var overflow_x = 0;
      var overflow_y = 0;

      if(  startTransform.offset.x + offset.x > 0 ){
        overflow_x = startTransform.offset.x + offset.x
      }
      else if( elOriginSize.width * startTransform.scale + (startTransform.offset.x + offset.x) - clientWidth < 0 ){
        overflow_x = elOriginSize.width * startTransform.scale + (startTransform.offset.x + offset.x) - clientWidth;

      }
      else{
        overflow_x = 0;
      }

      // if(overflow_x == 0){
        overflow_y = startTransform.offset.y + offset.y
      // }

      return {
        x: overflow_x
        ,y: overflow_y
      }
    }

    // 使图片贴合到容器边缘
    ,setCloseTo_slideline: function(el, elOriginSize, elOffset, transform){
      var scale = transform.scale;
      var offset = transform.offset;

      var currScale = 1;
      var currOffset = {x: 0, y: 0};

      // container size 不一定事client
      var clientWidth = document.documentElement.clientWidth;
      var clientHeight = document.documentElement.clientHeight;

      if( scale < 1 ){
        currScale = 1;
        currOffset = {x: 0, y: 0};
      }
      else{
        currScale = scale;
        currOffset = offset;

        if( elOriginSize.width * scale > clientWidth ){
          if(  offset.x + offset.x > 0){
            currOffset.x = 0;
          }
          else if( elOriginSize.width * scale + offset.x - clientWidth < 0 ){
            currOffset.x = 0 - (elOriginSize.width * scale - clientWidth);
          }
        }
        else{
          currOffset.x = 0;
        }

        if( elOriginSize.height * scale > clientHeight ){
          if( offset.y > 0 - elOffset.top * scale ){
            // currOffset.y = 0 - (this.get('clientHeight') - this.get('elOriginSize').height)/2*(scale*scale-1);
            currOffset.y = 0 - elOffset.top * scale;
          }
          else if( elOriginSize.height * scale + offset.y + elOffset.top * scale - clientHeight < 0 ){
            currOffset.y = 0 - ( elOriginSize.height * scale + elOffset.top * scale  - clientHeight);
          }
        }
        else{
          currOffset.y = 0 - (elOffset.top * scale - (clientHeight - elOriginSize.height * scale) / 2)
        }
      }

      return {
        scale: currScale
        ,offset: currOffset
      }
    }

    ,setTransform: function(el, transform, timer, finger){
      if( !el || el.length == 0 ) return false;

      el.css('-webkit-transform', 'translate(' + transform.offset.x + 'px,' + transform.offset.y + 'px) scale(' + transform.scale + ')');
      el.data('transform', transform);
      if( timer * 1.5 ){
        el.addClass('transition_back');
        setTimeout(function(){
          el.removeClass('transition_back')
        }, timer * 1.5)
      }
    }

    // 缩放图片： 根据放大倍数，放大重心点
    ,setScaleByOrigin: function(scale, startTransform, originPoint){
      var new_scale = scale * startTransform.scale;

      var O = {
        x: (startTransform.scale - new_scale) / startTransform.scale * (originPoint.x - startTransform.offset.x)
        ,y: (startTransform.scale - new_scale) / startTransform.scale * (originPoint.y - startTransform.offset.y)
      }

      var offset = {
        x: startTransform.offset.x + O.x
        ,y: startTransform.offset.y + O.y
      };

      return {
        scale: new_scale
        ,offset: offset
      }
    }

    ,getOffsetOnTwoPoints: function(p1, p2){
      return {
        x: p2.x - p1.x
        ,y: p2.y - p1.y
      }
    }

    // 一跟手指滑动时，获取touch 坐标
    ,getTouchPoint: function(touches, offset){
      if(!offset){
        offset = {left: 0, top: 0};
      }
      return {
        x: touches[0].pageX - offset.left
        ,y: touches[0].pageY - offset.top
      }
    }

    // 两根手指滑动时， 获取touch 坐标
    ,getTouchPoints: function(touches, offset){
      if(!offset){
        offset = {left: 0, top: 0};
      }
      return Array.prototype.slice.call(touches).map(function (touch) {
        return {
            x: touch.pageX - offset.left,
            y: touch.pageY - offset.top
        };
      });
    }

    ,getSlideAction: function(points, count_points, overflow, transform){
      if( !points || points.length <= 1 ){
        return false;
      }

      var clientWidth = document.documentElement.clientWidth;
      var clientHeight = document.documentElement.clientHeight;

      var len = points.length;
      var dt = points[len-1].t - points[0].t;

      if( Math.abs(overflow.x) >  clientWidth / 2){
        if( overflow.x < 0 ){
          return 'next';
        }
        else{
          return 'prev';
        }
      }

      if( dt < 500 ){
        var slideAddition = points[count_points-1].x - points[count_points-2].x;

        var t_a = 0, t_d = 0, all_t = 0, all_d = 0;
        for(var i = 0; i < count_points-1; ++i ){
          var a = points[i], b = points[i+1];
          if( a.x > b.x ){
            ++t_a;
          }
          else if(a.x < b.x){
            ++t_d;
          }
          all_t += Math.abs(a.t-b.t);
          all_d += Math.abs(a.x-b.x);
        }

        // scale == 1 || (overflow.x != 0)
        if( transform.scale == 1 || Math.abs(overflow.x) > clientWidth / 10 ){
          // console.log(all_d/all_t, t_d, t_a, count_points)

          var speed = 0.3;
          if( all_d / all_t > speed && t_d == count_points - 1 ){
            // console.log('prev')
            return 'prev';
          }
          else if( all_d / all_t > speed && t_a == count_points - 1 ){
            // console.log('next')
            return 'next';
          }
        }
      }

      return '';
    }

    // 矫正到x,y轴直线
    ,getRectifiedCoo: function(points, prev_action){
      if( points.length <= 1 ){
        return {
          point: points[points.length-1]
          ,action: prev_action
        }
      }

      prev_action = prev_action || '';

      var len = points.length;
      var action = prev_action;
      for(var i = 0; i < len - 1; ++i){
        // console.log(action)
        action = rectify(points[i], points[i+1], action);
      }

      // p2 will be correct
      function rectify(p1, p2, action){
        var dx = Math.abs(p2.x - p1.x)
        ,dy = Math.abs(p2.y - p1.y);

        if( action == 'y' ){
          p2.y = p1.y;
          return 'y';
        }
        else if(action == 'x'){
          p2.x = p1.x;
          return 'x';
        }

        if( dx > dy ){
          p2.y = p1.y;
          return 'y';
        }
        else{
          p2.x = p1.x;
          return 'x';
        }
      }

      // getRectifiedCoo return
      return {
        point: points[len-1]
        ,action: action
      };
    }
  }

  return Tools;
}, {
  requires: []
})
/**
  * 一根手指在图片上滑动，产生的效果
  * @param{DOM_Object} 容器的dom引用 box
  * @param{String} 容器内，有且仅有一个子元素的class标记名，用于委托事件处理，实现切换图片是锁的作用
  */

KISSY.add('kg/mobile-album/3.0.0/onefinger',function(S, Base, Node, Tools){
  var $ = Node.all;
  var COUNT_POINTS = 2;

  function OneFinger(cfg){
    OneFinger.superclass.constructor.call(this, cfg);
  }

  var ATTRS = {
    // DOM_Object
    box: {value: null}

    // className
    ,elTrigger: {value: ''}

    // 图片原始尺寸
    ,elOriginSize: {
      value: {width: 0, height: 0}
    }

    // 保存touchstart transform值
    ,startTransform: {
      value: {
        scale: 1
        ,offset: {x: 0, y: 0}
      }
    }

    // 移动过程中 缓存动作 偏移值
    ,offset: {value: {x: 0, y: 0}}

    // 容器box，溢出值
    ,overflow_d: {value: 0}

    // 保存touchstart point 坐标
    ,startPoint: {
      value: {x: 0, y: 0}
    }

    ,cachedPoints: {
      value: []
    }

    // 在图片被用户执行pinch操作，并且pinch放大到scale>1的时候，不允许，立即执行切换图片的功能
    ,__slideActionFreeze__: {
      value: false
    }

    ,__must_slide__: {
      value: false
    }

    ,__forbidden__: {
      value: false
    }
  }

  var o = {
    initializer: function(){
      this._event();
    }

    ,"stopMoving": function(){

    }

    // ,isForbidden: function(){
    //   if( this.get('__forbidden__') == true ){
    //     return true;
    //   }
    //   else{
    //     return false;
    //   }
    // }

    ,_event: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');

      box.delegate('touchstart', elTrigger, this._touchstart, this);

      box.delegate('gesturestart', elTrigger, this._gesturestart, this);

      box.delegate('doubleTap', elTrigger, this._doubleTap, this);
    }

    // 初始化状态值 touchstart 时调用
    ,initStatus: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');

      var el = box.one(elTrigger);

      this.set('offset', {x: 0, y: 0});

      this.set('startTransform', el.data('transform') || {scale: 1, offset: {x: 0, y: 0}});

      if( this.get('startTransform').scale <= 1 ){
        this.set('__must_slide__', true);
      }

      var img = el;
      if( el.prop('tagName').toUpperCase() != 'IMG' ){
        img = el.all('img')
      }
      this.set('elOriginSize', {
        width: img.prop('offsetWidth')
        ,height: img.prop('offsetHeight')
      });

      this.set('elOffset', {
        left: img.prop('offsetLeft')
        ,top: img.prop('offsetTop')
      })

      this.set('cachedPoints', []);

      this.set('move_action', '');
    }

    // 保存持久化值
    ,saveStatus: function(){
      var startTransform = this.get('startTransform');
      var offset = this.get('offset');

      this.set('startTransform', {
        scale: startTransform.scale
        ,offset: {
          x: startTransform.offset.x + offset.x
          ,y: startTransform.offset.y + offset.y
        }
      });

      this.set('offset', {x: 0, y: 0});
    }

    ,_doubleTap: function(e){

      // if( this.isForbidden() ){
      //   return ;
      // }

      var point = Tools.getTouchPoint([e.touch]);
      if( this.get('startTransform').scale != 1  ){
        this.set('startTransform', {
          scale: 1
          ,offset: {
            x: 0
            ,y: 0
          }
        })
      }
      else{
        var transform = Tools.setScaleByOrigin(3, this.get('startTransform'), point);
        this.set('startTransform', transform);
      }

      this.update(300);
    }

    ,_gesturestart: function(){
      this._touchend({
        freeze: true
      });
    }

    ,_touchstart: function(e){
      // if( this.isForbidden() ){
      //   return ;
      // }

      if( e.touches.length > 1 ){
        return ;
      }

      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var point = Tools.getTouchPoint(e.touches);
      this.set('startPoint', point);

      // init status
      this.initStatus();
      box.undelegate('touchmove', elTrigger, this._touchmove, this);
      box.undelegate('touchend', elTrigger, this._touchend, this);

      box.delegate('touchmove', elTrigger, this._touchmove, this);
      box.delegate('touchend', elTrigger, this._touchend, this);

      // 增加动画效果
      el.removeClass('transition_back');
      el.addClass('transition_move');
    }

    ,_touchmove: function(e){
      // if( this.isForbidden() ){
      //   return ;
      // }
      if( e.touches.length > 1 ){
        this._touchend({
          freeze: true
        });
        return ;
      }

      var startPoint = this.get('startPoint');
      var point = Tools.getTouchPoint(e.touches);


      point = this._rectifyCoo(point);

      this._cachePoints(point);
      

      var offset = Tools.getOffsetOnTwoPoints(startPoint, point);

      var overflow_offset = Tools.getBoxOffsetIfOverflow(this.get('startTransform'), this.get('elOriginSize'), offset);

      if( this.get('startTransform').scale > 1 && this.get('__must_slide__') == false ){
        overflow_offset.x = overflow_offset.x / 4;
        offset.x = offset.x - overflow_offset.x * 4;
      }
      else{
        offset.x = offset.x - overflow_offset.x;
      }

      // offset.y = offset.y - overflow_offset.y;

      this.set('overflow_d', overflow_offset.x);


      this.set('offset', offset);
      this.update(0);
    }

    // 矫正 坐标
    ,_rectifyCoo: function(point){
      if( this.get('startTransform').scale > 1 ){
        return point;
      }

      var cachedPoints = this.get('cachedPoints');
      cachedPoints.push(point);
      var ret = Tools.getRectifiedCoo(cachedPoints, this.get('move_action'))
      point = ret.point;
      this.set('move_action', ret.action)
      cachedPoints.pop();

      return point;
    }

    ,_touchend: function(e){
      // if( this.isForbidden() ){
      //   return ;
      // }
      if(e && e.touches && e.touches.length > 0 ){
        return ;
      }
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');

      var el = box.one(elTrigger);

      this.saveStatus();

      if( e.freeze === true ){
        // do nothing
      }
      else{
        var transform = Tools.setCloseTo_slideline(el, this.get('elOriginSize'), this.get('elOffset'), this.get('startTransform'));
        this._needSlide(transform);
        this.set('startTransform', transform);
        this.update(300);
      }
      if( this.get('overflow_d') != 0 ){
        this.set('overflow_d', 0);

        if( e.freeze === true ){
          this.update();
        }
        else{
          this.update(300);
        }
      }

      box.undelegate('touchmove', elTrigger, this._touchmove, this);
      box.undelegate('touchend', elTrigger, this._touchend, this);

      // 去除动画效果
      el.removeClass('transition_move');
    }

    ,_needSlide: function(transform){
      var cachedPoints = this.get('cachedPoints');
      if( cachedPoints.length == COUNT_POINTS ){
        cachedPoints[cachedPoints.length - 1].t = +new Date();
        var slideAction = Tools.getSlideAction(cachedPoints, COUNT_POINTS, {
          x: this.get('overflow_d')
        }, transform);

        if(slideAction != ''){
          if( this.get('__must_slide__') == true ){
            this.set('__must_slide__', false);
            this.fire('slide-' + slideAction);
          }
          else{
            this.set('__must_slide__', true);
          }
        }
      }
    }

    ,_cachePoints: function(point){
      if(!point.t){
        point.t = +new Date();
      }

      var cachedPoints = this.get('cachedPoints');
      cachedPoints.push(point);

      if( cachedPoints.length > COUNT_POINTS ){
        cachedPoints = cachedPoints.splice( cachedPoints.length - COUNT_POINTS );
      }

      this.set('cachedPoints', cachedPoints);
    }

    // update el css style
    ,update: function(timer){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var offset = this.get('offset');
      var startTransform = this.get('startTransform');

      var currTransform = {
        scale: startTransform.scale
        ,offset: {
          x: startTransform.offset.x + offset.x
          ,y: startTransform.offset.y + offset.y
        }
      }

      Tools.setTransform(el, currTransform, timer);

      var slide_left = box.data('slide_left') || 0;

      if(timer){
        timer = 500;
  
        box.css('left', (slide_left + this.get('overflow_d') ) + 'px');

        box.addClass('transition_back');
        setTimeout(function(){
          box.removeClass('transition_back');
        }, timer);
      }
      else{
        box.removeClass('transition_back');
        box.css('left', (slide_left + this.get('overflow_d') ) + 'px');
      }
    }
  }

  S.extend(OneFinger, Base, o, {
    ATTRS: ATTRS
  });

  return OneFinger;
}, {
  requires: ['base', 'node', './tools']
});
/**
  * yumen.gk 2014-10-27 20:45
  * 双点跟随
  */

KISSY.add('kg/mobile-album/3.0.0/twofinger',function(S, Base, UA, Node, Tools){
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
/**
  * 是否可切换图片
  */

KISSY.add('kg/mobile-album/3.0.0/slide',function(S, Base, Node){
  var $ = Node.all;

  function Slide(cfg){
    Slide.superclass.constructor.call(this, cfg);
  }

  var ATTRS = {
    box: {value: null}

    ,elTrigger: {value: ''}

    ,slide_left: {value: '0'}
  }

  var o = {
    initializer: function(){

    }

    ,"run": function(points, overflow){
      if( !points || points.length <= 1 ){
        return false;
      }

      var clientWidth = document.documentElement.clientWidth;
      var clientHeight = document.documentElement.clientHeight;

      var len = points.length;
      var dt = points[len-1].t - points[0].t;

      if( Math.abs(overflow.x) >  clientWidth / 2){
        if( overflow.x < 0 ){
          this.slide_next();
        }
        else{
          this.slide_prev();
        }
      }

      if( dt < 500 ){

      }
    }

    ,slide: function(){

    }
    ,slide_prev: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      if( this.hasPrev(el) ){
        var slide_left = this.get('slide_left');
        var clientWidth = document.documentElement.clientWidth;

        slide_left += clientWidth + 10;
        box.css('left', slide_left);
        box.data('slide_left', slide_left);

        this.set('slide_left', slide_left);
        this.switchToPrev();
      }
      else{
        return false;
      }

    }
    ,slide_next: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      if( this.hasNext(el) ){
        var slide_left = this.get('slide_left');
        var clientWidth = document.documentElement.clientWidth;

        slide_left -= clientWidth + 10;
        box.css('left', slide_left);
        box.data('slide_left', slide_left);

        this.set('slide_left', slide_left);
        this.switchToNext();
      }
      else{
        return false;
      }

    }

    ,hasPrev: function(el){
      if( el.prev() && el.prev().length > 0 ){
        return true;
      }
      return false;
    }
    ,hasNext: function(el){
      if( el.next() && el.next().length > 0 ){
        return true;
      }
      return false;
    }
    
    ,switchTo: function(index){

    }

    ,switchToPrev: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var prev = el.prev();

      el.removeClass(elTrigger);

      setTimeout(function(){
        prev.addClass(elTrigger);
        prev.css('-webkit-transform-origin', '0 0');
      }, 300);

      this.initStyle(el);
    }
    ,switchToNext: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');
      var el = box.one(elTrigger);

      var next = el.next();

      el.removeClass(elTrigger);

      setTimeout(function(){
        next.addClass(elTrigger);
        next.css('-webkit-transform-origin', '0 0');
      }, 300)

      this.initStyle(el);
    }

    ,initStyle: function(el){
      setTimeout(function(){
        el.css('-webkit-transform', 'translate(0,0) scale(1)');
        el.data('transform', {
          scale: 1
          ,offset: {x: 0, y: 0}
        })
      }, 300)
    }

  }

  S.extend(Slide, Base, o, {
    ATTRS: ATTRS
  });

  return Slide;
}, {
  requires: ['base', 'node']
})
/**
  * 无线相册
  *  2014年逆向交易，第二版
  */

KISSY.add('kg/mobile-album/3.0.0/album',function(S, Base, Node, OneFinger, TwoFinger, Slide){
  var $ = Node.all;

  function MA(cfg){
    MA.superclass.constructor.call(this, cfg);
  }

  var ATTRS = {
    box: {
      value: null, 
      getter: function(v){
        return $(v);
      }
      ,setter: function(v){
        return $(v);
      }
    }
    ,elTrigger: {value: '.J_AlbumSlideItem'}
    ,J_AlbumSlideItem: {value: ''}
  };
  var o = {
    initializer: function(){
      this.prepareStyle();

      var onefinger = new OneFinger({
        box: this.get('box')
        ,elTrigger: this.get('elTrigger')
      });

      var towfinger = null;

      var slide = new Slide({
        box: this.get('box')
        ,elTrigger: this.get('elTrigger')
      });


      onefinger.on('slide-prev', function(e){
        slide.slide_prev();
      }).on('slide-next', function(e){
        slide.slide_next();
      });

      var twofinger = new TwoFinger({
        box: this.get('box')
        ,elTrigger: this.get('elTrigger')
        ,maxScale: 3
      })

      // twofinger.on('start', function(){
      //   onefinger.set('__forbidden__', true);
      // }).on('end', function(){
      //   onefinger.set('__forbidden__', false);
      // })


      this.set('onefinger', onefinger);
      this.set('slide', slide);

      this._event();
    }

    ,_event: function(){
      var self = this;
      var box = self.get('box');

      function haltEvent(e){
        e.halt();
      }

      $(document).on('touchstart', haltEvent);
      box.on('singleTap', function(){
        $(document).detach('touchstart', haltEvent);
        self.fire('close');
      });
      
    }

    // after resize or 翻转屏幕
    ,prepareStyle: function(){
      var box = this.get('box')
      ,elTrigger = this.get('elTrigger');

      box.children().item(0).addClass(elTrigger);
      
      var el = box.all(elTrigger);

      el.css('-webkit-transform-origin', '0 0')
    }
  };

  S.extend(MA, Base, o, {
    ATTRS: ATTRS
  });

  return MA;
}, {
  requires: ['base', 'node', './onefinger', './twofinger', './slide']
})
