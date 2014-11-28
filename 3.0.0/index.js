/**
  * 无线相册
  *  2014年逆向交易，第二版
  */

KISSY.add(function(S, Base, Node, XT, Album, AlbumXtpl){
  var $ = Node.all;

  function A(cfg){
    A.superclass.constructor.call(this, cfg);
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

    ,album: {value: null}
  };
  var o = {
    initializer: function(){
    }

    ,_equipAlbum: function(){
      var album = new Album({
        box: this.get('box')
        ,elTrigger: this.get('elTrigger')
      });

      album.on('close', this.destory);

      this.resetWidth();

      this.set('album', album);
    }

    ,resetWidth: function(){
      var box = this.get('box');
      var elTrigger = this.get('elTrigger');

      if(box){
        box.children().each(function(c){
          c.width(document.documentElement.clientWidth);
        });
      }
    }

    ,"render": function(data){
      this.set('data', data);

      var html = new XT(AlbumXtpl).render({
        data: this.get('data')
      });

      var albumDom = $(html);
      albumDom.css('opacity', 0);
      albumDom.appendTo($(document.body));

      setTimeout(function(){
        albumDom.animate({
          opacity: 1
        }, 0.5);
      }, 20);

      this.set('box', '#J_AlbumMBox');
      this.set('elTrigger', '.J_AlbumSlideItem');
      this._equipAlbum();
    }

    ,"show": function(){

    }
    ,"hide": function(){

    }
    ,"destory": function(){
      var self = this;
      var boxWrap = this.get('box').parent();
      boxWrap.animate({
        opacity: 0
      }, 0.5, 'ease', function(){
        boxWrap.remove();
      })
    }

  };

  S.extend(A, Base, o, {
    ATTRS: ATTRS
  });

  return A;
}, {
  requires: ['base', 'node', 'xtemplate', './album', './album-xtpl', './mobilealbum-style.css']
});