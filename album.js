/**
  * 无线相册
  *  2014年逆向交易，第二版
  */

KISSY.add(function(S, Base, Node, OneFinger, TwoFinger, Slide){
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