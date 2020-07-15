"use strict";
exports.__esModule = true;
exports.SetupFile = void 0;
var electron_1 = require("electron");
var Storage = require("electron-store");
var SetupFile = /** @class */ (function () {
    function SetupFile() {
        this.storage = new Storage();
    }
    SetupFile.prototype.init = function () {
        var _this = this;
        window.onload = function () {
            var $ = require("jquery");
            $("#pasteClipboard").on("click", function () {
                //@ts-ignore
                document.querySelector("#host").value = _this.readClipboard();
            });
            $("#setHost").on("click", function () {
                location.pathname = location.pathname.replace("setup.html", "index.html");
                //@ts-ignore
                _this.storage.set("host", document.querySelector("#host").value);
            });
        };
    };
    SetupFile.prototype.readClipboard = function () {
        return electron_1.ipcRenderer.sendSync("readClipboard");
    };
    return SetupFile;
}());
exports.SetupFile = SetupFile;
;
//# sourceMappingURL=setupFile.js.map