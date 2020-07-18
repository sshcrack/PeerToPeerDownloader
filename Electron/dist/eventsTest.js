"use strict";
exports.__esModule = true;
var downloadManager_1 = require("./downloadManager");
var file_1 = require("./file");
var example = new file_1.File();
example.filename = "C:/Users/Hendrik/Downloads/test.png";
example.url = "http://kleintierpraxis-meppen.de/Eltech/blog/Meine%20Bilder/imgs/img0full.png";
var manager = new downloadManager_1.DownloadManager(example);
var emitter = manager.getEmitter();
emitter.on("progress", function (args) {
});
emitter.on("error", function (err) {
    console.error(err[0].stack);
});
manager.download();
setTimeout(function () { return manager.pause(); }, 500);
setTimeout(function () { return manager.resume(); }, 1000);
setTimeout(function () { return manager.pause(); }, 1500);
setTimeout(function () { return manager.resume(); }, 2000);
//# sourceMappingURL=eventsTest.js.map