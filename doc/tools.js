/**
  * mobile album tools
  */

KISSY.add(function(S){
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