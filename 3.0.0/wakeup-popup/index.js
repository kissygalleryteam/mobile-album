/**
 * 
 * @authors yumen.gk (yumen.gk@taobao.com | g.gaokai@gmail.com)
 * @date    2013-12-09 17:50:42
 * @version 2
 * @desc    唤醒fixed模块时，如果同时唤醒了手机键盘，iphone及其部分android浏览器 fixed 定位会失效，  这里采用监听 touchend事件，还原scroll定位，实现fixed相对位置不变
 * 
 */

KISSY.add(function(S, Node, Base){
    var $ = Node.all;

    function WakeupPopup(config){
        this.msgPanelHelp = {
            curScrollTop: 0,
            timeout: null
        }

        this.isLive = false;
    }

    var o = {
        'wakeup': function(){
            if( this.isLive == true ){
                return ;
            }
            this.isLive = true;
            this.wakeupMsgPanel();
            this.msgPanelTouchend();
        }
        ,'sleep': function(){
            this.isLive = false;
            this.sleepMsgPanel();
        }

        ,wakeupMsgPanel: function(){
            var self = this;
            self.msgPanelHelp.curScrollTop = document.body.scrollTop;
            document.body.scrollTop = 0;
            $(document).on('touchstart', self.msgPanelTouchstart, self);
        }
        ,msgPanelTouchstart: function(){
            var self = this;
            $(document).on('touchend', self.msgPanelTouchend, self);
        }
        ,msgPanelTouchend: function(){
            var self = this;
            self.msgPanelHelp.timeout && clearTimeout(self.msgPanelHelp);
            self.msgPanelHelp.timeout = setTimeout(function(){
                document.body.scrollTop = 0;
            },2.0.0);
        }
        ,sleepMsgPanel: function(){
            var self = this;
            setTimeout(function(){
                document.body.scrollTop = self.msgPanelHelp.curScrollTop;
            }, 2.0.0);
            $(document).detach('touchstart', self.msgPanelTouchstart, self);
            $(document).detach('touchend',   self.msgPanelTouchend,   self);
        }
    }

    S.extend(WakeupPopup, Base, o);

    return WakeupPopup;
},{
    requires: ['node', 'base']
})

