## 综述

MobileAlbum是。

* 版本：2.0.0
* 作者：yumen.gk
* demo：[http://kg.kissyui.com/mobile-album/2.0.0/demo/index.html](http://kg.kissyui.com/mobile-album/2.0.0/demo/index.html)

## 初始化组件

    S.use('kg/mobile-album/2.0.0/index', function (S, MobileAlbum) {
         var mobile-album = new MobileAlbum();
    })

## 使用方法
###依赖dom结构
```html
<section id="J_PinchBoxWrap" class="f18-pinch-box" style="display: none;">
    <div id="J_PinchBox">
        
    </div>
    <div class="pinch-ctl">
        <a class="J_Back back" href="##">返回</a>
        <ul class="slide-pinch-trigger J_SlidePinchTrigger">
        </ul>
        <ul class="image-desc"></ul>
    </div>
</section>
```

###javascript 编写
```javascript
KISSY.use('node, json, kg/mobile-album/2.0.0/index', function(S, Node, JSON, MoAm){
    var $ = Node.all;

    var MoAm = new MoAm({
        box: $('#J_PinchBox')
        ,boxWrap: $('#J_PinchBoxWrap')
        ,minScale: 0.2
        ,maxScale: 20
    })

    var data = [{
        minSrc: 'image.jpg_80x80.jpg',
        originSrc: 'image.jpg',
        index: 0,
        size: {
            width: 80,
            height: 50
        }
    },{
        minSrc: 'image2.jpg_80x80.jpg',
        originSrc: 'image2.jpg',
        index: 1,
        size: {
            width: 50,
            height: 80
        }
    }]

    MoAm.setIndex(parseInt(target.attr('data-idx')))
    MoAm.data(data);
    MoAm.init();

    $(document).delegate('singleTap click', '.J_Back', function(e){
        MoAm.hide();
    })
})
```
