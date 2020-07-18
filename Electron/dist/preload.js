"use strict";
// All of the Node.js APIs are available in the preload process.
exports.__esModule = true;
var indexFile_1 = require("./indexFile");
var setupFile_1 = require("./setupFile");
var index = location.pathname.endsWith("index.html");
var setup = location.pathname.endsWith("setup.html");
if (index) {
    new indexFile_1.IndexFile().init();
}
if (setup) {
    new setupFile_1.SetupFile().init();
}
//# sourceMappingURL=preload.js.map