KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('mobile-album', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/mobile-album/2.0.0/']});