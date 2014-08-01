/**
 * @fileoverview 
 * @author yumen.gk<yumen.gk@taobao.com>
 * @module mobile-album
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class MobileAlbum
     * @constructor
     * @extends Base
     */
    function MobileAlbum(comConfig) {
        var self = this;
        //调用父类构造函数
        MobileAlbum.superclass.constructor.call(self, comConfig);
    }
    S.extend(MobileAlbum, Base, /** @lends MobileAlbum.prototype*/{

    }, {ATTRS : /** @lends MobileAlbum*/{

    }});
    return MobileAlbum;
}, {requires:['node', 'base']});



