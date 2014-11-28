/**
  * 是否可切换图片
  */

KISSY.add(function(S, Base, Node){
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