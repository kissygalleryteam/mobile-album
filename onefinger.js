/**
  * 一根手指在图片上滑动，产生的效果
  * @param{DOM_Object} 容器的dom引用 box
  * @param{String} 容器内，有且仅有一个子元素的class标记名，用于委托事件处理，实现切换图片是锁的作用
  */

KISSY.add(function(S, Base, Node, Tools){
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