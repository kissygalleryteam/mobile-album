## 综述

MobileAlbum是支持单指拖拽，切换图片；支持双指pinch缩放图片的无线端相册组件。

* 版本：3.0.0
* 作者：yumen.gk

## 使用方法
###依赖dom结构
```
无依赖
```

### 初始化组件

```
    var imgs = [{
      src: 'http://img01.taobaocdn.com/imgextra/i1/687471686/TB1yIiUGFXXXXciXVXXXXXXXXXX_!!687471686-2-tstar.png_290x10000.jpg'
    }, {
      src: 'http://gtms01.alicdn.com/tps/i1/TB1hQ7aGFXXXXcBXXXXGAs77XXX-600-3546.jpg'
    }, {
      src: 'http://img03.taobaocdn.com/imgextra/i3/291599648/TB1VnDQGpXXXXaJXpXXXXXXXXXX_!!291599648-0-tstar.jpg_620x10000.jpg'
    }, {
      src: 'http://img02.taobaocdn.com/imgextra/i2/14701043388472450/T1BcdRXpRlXXXXXXXX_!!290804701-0-tstar.jpg_400x400.jpg'
    }];
    
    S.use('kg/mobile-album/3.0.0/index', function (S, MobileAlbum) {
         var album = new MobileAlbum();

         album.render(imgs);
    })
```
