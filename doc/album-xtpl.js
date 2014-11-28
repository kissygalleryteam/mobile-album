/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '<div class="album-m">\n    <div id="J_AlbumMBox" class="album-m-slide">\n      ';
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyUtil(engine, scope, "data", 0, 3);
            params1.push(id2);
            var id3 = getPropertyUtil(engine, scope, "xindex", 0, 3);
            params1.push(id3);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n      <div class="album-m-slide-item">\n        <div class="album-m-imgbox">\n          <div class="J_PinchBox pinch-box">\n              <img src="';
                var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "src", 0, 7);
                buffer += renderOutputUtil(id4, true);
                buffer += '" data-originSrc="';
                var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "originSrc", 0, 7);
                buffer += renderOutputUtil(id5, true);
                buffer += '">\n          </div>\n          <div class="counter">\n            <ul>\n              ';
                var config6 = {};
                var params7 = [];
                var id8 = getPropertyUtil(engine, scope, "data", 0, 11);
                params7.push(id8);
                var id9 = getPropertyUtil(engine, scope, "xindex", 0, 11);
                params7.push(id9);
                config6.params = params7;
                config6.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n                <li ';
                    var config10 = {};
                    var params11 = [];
                    var id12 = getPropertyUtil(engine, scope, "xindex", 0, 12);
                    var id13 = getPropertyUtil(engine, scope, "xindex", 1, 12);
                    params11.push(id12 === id13);
                    config10.params = params11;
                    config10.fn = function (scope) {
                        var buffer = "";
                        buffer += 'class="current"';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config10, "if", 12);
                    buffer += '></li>\n              ';
                    return buffer;
                };
                buffer += runBlockCommandUtil(engine, scope, config6, "each", 11);
                buffer += '\n            </ul>\n          </div>\n        </div>\n      </div>\n      ';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config0, "each", 3);
            buffer += '\n    </div>\n</div>';
            return buffer;
        };
});