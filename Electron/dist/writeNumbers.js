"use strict";
exports.__esModule = true;
var fs = require("fs");
var text = "";
for (var i = 0; i < 10000000; i++) {
    text += i + " ";
}
fs.writeFileSync("numbers.txt", text);
//# sourceMappingURL=writeNumbers.js.map