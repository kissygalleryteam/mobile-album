/*!build time : 2014-11-28 2:09:05 PM*/
KISSY.add("kg/mobile-album/3.0.0/slide",function(a,b,c){function d(a){d.superclass.constructor.call(this,a)}var e=(c.all,{box:{value:null},elTrigger:{value:""},slide_left:{value:"0"}}),f={initializer:function(){},run:function(a,b){if(!a||a.length<=1)return!1;{var c=document.documentElement.clientWidth,d=(document.documentElement.clientHeight,a.length);a[d-1].t-a[0].t}Math.abs(b.x)>c/2&&(b.x<0?this.slide_next():this.slide_prev())},slide:function(){},slide_prev:function(){var a=this.get("box"),b=this.get("elTrigger"),c=a.one(b);if(!this.hasPrev(c))return!1;var d=this.get("slide_left"),e=document.documentElement.clientWidth;d+=e+10,a.css("left",d),a.data("slide_left",d),this.set("slide_left",d),this.switchToPrev()},slide_next:function(){var a=this.get("box"),b=this.get("elTrigger"),c=a.one(b);if(!this.hasNext(c))return!1;var d=this.get("slide_left"),e=document.documentElement.clientWidth;d-=e+10,a.css("left",d),a.data("slide_left",d),this.set("slide_left",d),this.switchToNext()},hasPrev:function(a){return a.prev()&&a.prev().length>0?!0:!1},hasNext:function(a){return a.next()&&a.next().length>0?!0:!1},switchTo:function(){},switchToPrev:function(){var a=this.get("box"),b=this.get("elTrigger"),c=a.one(b),d=c.prev();c.removeClass(b),setTimeout(function(){d.addClass(b),d.css("-webkit-transform-origin","0 0")},300),this.initStyle(c)},switchToNext:function(){var a=this.get("box"),b=this.get("elTrigger"),c=a.one(b),d=c.next();c.removeClass(b),setTimeout(function(){d.addClass(b),d.css("-webkit-transform-origin","0 0")},300),this.initStyle(c)},initStyle:function(a){setTimeout(function(){a.css("-webkit-transform","translate(0,0) scale(1)"),a.data("transform",{scale:1,offset:{x:0,y:0}})},300)}};return a.extend(d,b,f,{ATTRS:e}),d},{requires:["base","node"]});