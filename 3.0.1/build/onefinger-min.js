/*!build time : 2014-11-28 2:09:05 PM*/
KISSY.add("kg/mobile-album/3.0.0/tools",function(){var a={getBoxOffsetIfOverflow:function(a,b,c){var d=document.documentElement.clientWidth,e=(document.documentElement.clientHeight,0),f=0;return e=a.offset.x+c.x>0?a.offset.x+c.x:b.width*a.scale+(a.offset.x+c.x)-d<0?b.width*a.scale+(a.offset.x+c.x)-d:0,f=a.offset.y+c.y,{x:e,y:f}},setCloseTo_slideline:function(a,b,c,d){var e=d.scale,f=d.offset,g=1,h={x:0,y:0},i=document.documentElement.clientWidth,j=document.documentElement.clientHeight;return 1>e?(g=1,h={x:0,y:0}):(g=e,h=f,b.width*e>i?f.x+f.x>0?h.x=0:b.width*e+f.x-i<0&&(h.x=0-(b.width*e-i)):h.x=0,b.height*e>j?f.y>0-c.top*e?h.y=0-c.top*e:b.height*e+f.y+c.top*e-j<0&&(h.y=0-(b.height*e+c.top*e-j)):h.y=0-(c.top*e-(j-b.height*e)/2)),{scale:g,offset:h}},setTransform:function(a,b,c){return a&&0!=a.length?(a.css("-webkit-transform","translate("+b.offset.x+"px,"+b.offset.y+"px) scale("+b.scale+")"),a.data("transform",b),void(1.5*c&&(a.addClass("transition_back"),setTimeout(function(){a.removeClass("transition_back")},1.5*c)))):!1},setScaleByOrigin:function(a,b,c){var d=a*b.scale,e={x:(b.scale-d)/b.scale*(c.x-b.offset.x),y:(b.scale-d)/b.scale*(c.y-b.offset.y)},f={x:b.offset.x+e.x,y:b.offset.y+e.y};return{scale:d,offset:f}},getOffsetOnTwoPoints:function(a,b){return{x:b.x-a.x,y:b.y-a.y}},getTouchPoint:function(a,b){return b||(b={left:0,top:0}),{x:a[0].pageX-b.left,y:a[0].pageY-b.top}},getTouchPoints:function(a,b){return b||(b={left:0,top:0}),Array.prototype.slice.call(a).map(function(a){return{x:a.pageX-b.left,y:a.pageY-b.top}})},getSlideAction:function(a,b,c,d){if(!a||a.length<=1)return!1;var e=document.documentElement.clientWidth,f=(document.documentElement.clientHeight,a.length),g=a[f-1].t-a[0].t;if(Math.abs(c.x)>e/2)return c.x<0?"next":"prev";if(500>g){for(var h=(a[b-1].x-a[b-2].x,0),i=0,j=0,k=0,l=0;b-1>l;++l){var m=a[l],n=a[l+1];m.x>n.x?++h:m.x<n.x&&++i,j+=Math.abs(m.t-n.t),k+=Math.abs(m.x-n.x)}if(1==d.scale||Math.abs(c.x)>e/10){var o=.3;if(k/j>o&&i==b-1)return"prev";if(k/j>o&&h==b-1)return"next"}}return""},getRectifiedCoo:function(a,b){function c(a,b,c){var d=Math.abs(b.x-a.x),e=Math.abs(b.y-a.y);return"y"==c?(b.y=a.y,"y"):"x"==c?(b.x=a.x,"x"):d>e?(b.y=a.y,"y"):(b.x=a.x,"x")}if(a.length<=1)return{point:a[a.length-1],action:b};b=b||"";for(var d=a.length,e=b,f=0;d-1>f;++f)e=c(a[f],a[f+1],e);return{point:a[d-1],action:e}}};return a},{requires:[]}),KISSY.add("kg/mobile-album/3.0.0/onefinger",function(a,b,c,d){function e(a){e.superclass.constructor.call(this,a)}var f=(c.all,2),g={box:{value:null},elTrigger:{value:""},elOriginSize:{value:{width:0,height:0}},startTransform:{value:{scale:1,offset:{x:0,y:0}}},offset:{value:{x:0,y:0}},overflow_d:{value:0},startPoint:{value:{x:0,y:0}},cachedPoints:{value:[]},__slideActionFreeze__:{value:!1},__must_slide__:{value:!1},__forbidden__:{value:!1}},h={initializer:function(){this._event()},stopMoving:function(){},_event:function(){var a=this.get("box"),b=this.get("elTrigger");a.delegate("touchstart",b,this._touchstart,this),a.delegate("gesturestart",b,this._gesturestart,this),a.delegate("doubleTap",b,this._doubleTap,this)},initStatus:function(){var a=this.get("box"),b=this.get("elTrigger"),c=a.one(b);this.set("offset",{x:0,y:0}),this.set("startTransform",c.data("transform")||{scale:1,offset:{x:0,y:0}}),this.get("startTransform").scale<=1&&this.set("__must_slide__",!0);var d=c;"IMG"!=c.prop("tagName").toUpperCase()&&(d=c.all("img")),this.set("elOriginSize",{width:d.prop("offsetWidth"),height:d.prop("offsetHeight")}),this.set("elOffset",{left:d.prop("offsetLeft"),top:d.prop("offsetTop")}),this.set("cachedPoints",[]),this.set("move_action","")},saveStatus:function(){var a=this.get("startTransform"),b=this.get("offset");this.set("startTransform",{scale:a.scale,offset:{x:a.offset.x+b.x,y:a.offset.y+b.y}}),this.set("offset",{x:0,y:0})},_doubleTap:function(a){var b=d.getTouchPoint([a.touch]);if(1!=this.get("startTransform").scale)this.set("startTransform",{scale:1,offset:{x:0,y:0}});else{var c=d.setScaleByOrigin(3,this.get("startTransform"),b);this.set("startTransform",c)}this.update(300)},_gesturestart:function(){this._touchend({freeze:!0})},_touchstart:function(a){if(!(a.touches.length>1)){var b=this.get("box"),c=this.get("elTrigger"),e=b.one(c),f=d.getTouchPoint(a.touches);this.set("startPoint",f),this.initStatus(),b.undelegate("touchmove",c,this._touchmove,this),b.undelegate("touchend",c,this._touchend,this),b.delegate("touchmove",c,this._touchmove,this),b.delegate("touchend",c,this._touchend,this),e.removeClass("transition_back"),e.addClass("transition_move")}},_touchmove:function(a){if(a.touches.length>1)return void this._touchend({freeze:!0});var b=this.get("startPoint"),c=d.getTouchPoint(a.touches);c=this._rectifyCoo(c),this._cachePoints(c);var e=d.getOffsetOnTwoPoints(b,c),f=d.getBoxOffsetIfOverflow(this.get("startTransform"),this.get("elOriginSize"),e);this.get("startTransform").scale>1&&0==this.get("__must_slide__")?(f.x=f.x/4,e.x=e.x-4*f.x):e.x=e.x-f.x,this.set("overflow_d",f.x),this.set("offset",e),this.update(0)},_rectifyCoo:function(a){if(this.get("startTransform").scale>1)return a;var b=this.get("cachedPoints");b.push(a);var c=d.getRectifiedCoo(b,this.get("move_action"));return a=c.point,this.set("move_action",c.action),b.pop(),a},_touchend:function(a){if(!(a&&a.touches&&a.touches.length>0)){var b=this.get("box"),c=this.get("elTrigger"),e=b.one(c);if(this.saveStatus(),a.freeze===!0);else{var f=d.setCloseTo_slideline(e,this.get("elOriginSize"),this.get("elOffset"),this.get("startTransform"));this._needSlide(f),this.set("startTransform",f),this.update(300)}0!=this.get("overflow_d")&&(this.set("overflow_d",0),a.freeze===!0?this.update():this.update(300)),b.undelegate("touchmove",c,this._touchmove,this),b.undelegate("touchend",c,this._touchend,this),e.removeClass("transition_move")}},_needSlide:function(a){var b=this.get("cachedPoints");if(b.length==f){b[b.length-1].t=+new Date;var c=d.getSlideAction(b,f,{x:this.get("overflow_d")},a);""!=c&&(1==this.get("__must_slide__")?(this.set("__must_slide__",!1),this.fire("slide-"+c)):this.set("__must_slide__",!0))}},_cachePoints:function(a){a.t||(a.t=+new Date);var b=this.get("cachedPoints");b.push(a),b.length>f&&(b=b.splice(b.length-f)),this.set("cachedPoints",b)},update:function(a){var b=this.get("box"),c=this.get("elTrigger"),e=b.one(c),f=this.get("offset"),g=this.get("startTransform"),h={scale:g.scale,offset:{x:g.offset.x+f.x,y:g.offset.y+f.y}};d.setTransform(e,h,a);var i=b.data("slide_left")||0;a?(a=500,b.css("left",i+this.get("overflow_d")+"px"),b.addClass("transition_back"),setTimeout(function(){b.removeClass("transition_back")},a)):(b.removeClass("transition_back"),b.css("left",i+this.get("overflow_d")+"px"))}};return a.extend(e,b,h,{ATTRS:g}),e},{requires:["base","node","./tools"]});