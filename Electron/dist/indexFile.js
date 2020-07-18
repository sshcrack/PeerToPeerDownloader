"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.IndexFile = void 0;
var electron_1 = require("electron");
var file_1 = require("./file");
var async = require("async");
var http = require("http");
var https = require("https");
var path = require("path");
var fs = require("fs");
var downloadManager_1 = require("./downloadManager");
var IndexFile = /** @class */ (function () {
    function IndexFile() {
    }
    ;
    IndexFile.prototype.init = function () {
        var _this = this;
        window.onload = function () {
            //@ts-ignore
            fitty("#downloading");
            var $ = require("jquery");
            var files = [];
            var downloadActive = false;
            $("#saveAs").on("click", function () {
                var urlElement = document.querySelector("#fileUrl");
                var url = urlElement.value;
                if (url == "" || url == undefined) {
                    _this.saveDialog();
                    return;
                }
                var fileName = url.split("/").pop();
                _this.saveDialog(fileName);
            });
            $("#pasteClipboard").on('click', function () {
                var clipboard = _this.readClipboard();
                var input = document.querySelector("#fileUrl");
                input.value = clipboard;
            });
            $("#add").on('click', function () {
                var filesList = document.querySelector("#filesList");
                var pathElement = document.querySelector("#FilePath");
                var urlElement = document.querySelector("#fileUrl");
                var filePath = pathElement.value;
                var url = urlElement.value;
                var child = document.createElement("li");
                child.setAttribute("addListID", files.length.toString());
                child.className = "list-group-item d-flex flex-row justify-content-center";
                if (filePath == "" || url == "") {
                    alert("Enter a path/url");
                    return;
                }
                child.innerHTML = "\n            <span class=\"url text-dark\">" + url.split("/")[url.split("/").length - 1] + "</span>\n            <div class=\"mx-1\"></div>\n            <i class=\"fas fa-arrow-right my-auto mx-2\"></i>\n            <span class=\"path text-black-50\">" + path.basename(filePath) + "</span>\n            <div class=\"progress m-auto\" id=\"progressBarParent\">\n              <div class=\"progress-bar noTransition\" role=\"progressbar\" style=\"width: 0%;\" addID=\"" + files.length + "\"></div>\n            </div>\n          ";
                //@ts-ignore
                fitty(".url");
                //@ts-ignore
                fitty(".path");
                var file = new file_1.File();
                file.filename = filePath;
                file.url = url;
                file.index = files.length;
                var index = files.push(file);
                var X = document.createElement("button");
                X.className = "my-auto close";
                X.innerHTML = "&times;";
                X.addEventListener('click', function () {
                    files.splice(index, 1);
                    child.remove();
                });
                child.appendChild(X);
                filesList.appendChild(child);
                pathElement.value = "";
                urlElement.value = "";
            });
            var currentFile;
            var paused = false;
            window.onbeforeunload = function (event) {
                if (!downloadActive) {
                    return;
                }
                var preventClosingButton = document.querySelector("#preventClosingButton");
                preventClosingButton.click();
                var quit = document.querySelector("#quit");
                quit.addEventListener("click", function () {
                    downloadActive = false;
                    electron_1.ipcRenderer.send("quit");
                });
                event.preventDefault();
                return true;
            };
            $("#download").on("click", function () { return __awaiter(_this, void 0, void 0, function () {
                var downloadButton, fileLabel, downloadProgress, processed, totalSize, totalDownloaded;
                var _this = this;
                return __generator(this, function (_a) {
                    downloadButton = document.getElementById("download");
                    fileLabel = document.querySelector("#downloading");
                    downloadProgress = document.querySelector("#downloadProgress");
                    downloadProgress.style = "display: inherit !important";
                    fileLabel.innerHTML = "Fetching download sizes... (0 from " + files.length + ")";
                    downloadActive = true;
                    downloadButton.setAttribute("disabled", "moino");
                    processed = 0;
                    totalSize = 0;
                    totalDownloaded = 0;
                    async.each(files, function (file, callback) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.getSize(file.url).then(function (size) {
                                file.size = size;
                                processed += 1;
                                totalSize += file.size == undefined ? 0 : file.size;
                                fileLabel.innerHTML = "Fetching download sizes... (" + processed + " from " + files.length + ")";
                                callback();
                            })["catch"](function (err) {
                                alert(err.error);
                                var index = files.indexOf(file);
                                if (index != -1)
                                    files.splice(index, 1);
                                var displayed = $("[addListID=\"" + file.index + "\"]")[0];
                                displayed.remove();
                                callback();
                            });
                            return [2 /*return*/];
                        });
                    }); }, function (err) {
                        fileLabel.innerHTML = "Starting to download....";
                        var fileProgress = document.querySelector("#fileProgress");
                        async.each(files, function (file, callback) { return __awaiter(_this, void 0, void 0, function () {
                            var splitted, manager, emitter, bar, getMBits, lastDownload, currentDownload;
                            var _this = this;
                            return __generator(this, function (_a) {
                                splitted = file.url.split("/");
                                fileLabel.innerHTML = "Downloading " + splitted[splitted.length - 1] + "...";
                                manager = new downloadManager_1.DownloadManager(file);
                                emitter = manager.getEmitter();
                                file.manager = manager;
                                currentFile = file;
                                manager.download();
                                bar = $("[addID=\"" + file.index + "\"]")[0];
                                getMBits = function () {
                                    if (file.finished)
                                        return;
                                    if (file.manager.paused) {
                                        setTimeout(getMBits, 1000);
                                        return;
                                    }
                                    var difference = currentDownload - lastDownload;
                                    lastDownload = currentDownload;
                                    var mbits = _this.roundDecimalPlace(difference / 1000 / 1000, 2);
                                    bar.innerHTML = mbits + " MB/s";
                                    setTimeout(getMBits, 1000);
                                };
                                lastDownload = 0;
                                currentDownload = 0;
                                setTimeout(getMBits, 1000);
                                emitter.on("progress", function (args) {
                                    var percent = args[0];
                                    if (percent != undefined) {
                                        bar.style = "width: " + percent + "%;";
                                        bar.classList.toggle("progress-bar-striped", false);
                                        bar.classList.toggle("progress-bar-animated", false);
                                        var chunk = args[2];
                                        currentDownload += chunk;
                                        totalDownloaded += chunk;
                                        var total = _this.roundDecimalPlace(totalDownloaded / totalSize * 100, 2);
                                        //@ts-ignore
                                        fileProgress.style = "width: " + total + "%;";
                                        fileProgress.innerHTML = total + "%";
                                        return;
                                    }
                                    bar.style.width = "100%";
                                    bar.innerHTML = (args[1] / 1000 / 1000) + " MB";
                                    bar.classList.toggle("progress-bar-striped", true);
                                    bar.classList.toggle("progress-bar-animated", true);
                                });
                                emitter.on("finished", function () {
                                    bar.classList.toggle("bg-success", true);
                                    bar.innerHTML = "Finished";
                                    file.finished = true;
                                    callback();
                                });
                                emitter.on("error", function (args) {
                                    var err = args[0];
                                    bar.classList.toggle("bg-danger", true);
                                    bar.innerHTML = "Error";
                                    fs.appendFile("./errors.txt", err.stack, function () { });
                                    callback();
                                });
                                return [2 /*return*/];
                            });
                        }); }, function (err) {
                            fileLabel.innerHTML = "Downloads finished!";
                            downloadButton.removeAttribute("disabled");
                            processed = 0;
                            totalSize = 0;
                            totalDownloaded = 0;
                            files = [];
                            var children = document.querySelector("#filesList").children;
                            for (var i = 0; i < children.length; i++) {
                                var child = children.item(i);
                                child.remove();
                            }
                            downloadActive = false;
                        });
                    });
                    return [2 /*return*/];
                });
            }); });
            $("#pause").on("click", function () {
                if (currentFile == undefined)
                    return;
                if (paused) {
                    currentFile.manager.resume();
                    $("#pause")[0].innerHTML = "Pause";
                }
                else {
                    currentFile.manager.pause();
                    $("#pause")[0].innerHTML = "Resume";
                }
                paused = !paused;
            });
            _this.ipcRendererInit();
        };
    };
    IndexFile.prototype.saveDialog = function (fileName) {
        electron_1.ipcRenderer.send("saveDialog", [fileName]);
    };
    IndexFile.prototype.readClipboard = function () {
        return electron_1.ipcRenderer.sendSync("readClipboard");
    };
    IndexFile.prototype.ipcRendererInit = function () {
        electron_1.ipcRenderer.on("saveDialogFinished", function (event, args) {
            if (args == null)
                return;
            var pathInput = document.querySelector("#FilePath");
            pathInput.value = args;
        });
    };
    IndexFile.prototype.getSize = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'HEAD'
            };
            var requestHandle = function (res) {
                var length = res.headers["content-length"];
                if (_this.isNumber(length)) {
                    resolve(parseInt(length));
                    return;
                }
                resolve(undefined);
            };
            var req;
            if (url.startsWith("http://"))
                req = http.request(url, options, requestHandle);
            if (url.startsWith("https://"))
                req = https.request(url, options, requestHandle);
            if (req != null) {
                req.end();
            }
            else {
                reject({ error: "Not a valid url" });
            }
        });
    };
    IndexFile.prototype.isNumber = function (Number) {
        return !isNaN(Number);
    };
    IndexFile.prototype.roundDecimalPlace = function (Number, place) {
        var multiplyWith = Math.pow(10, place);
        return Math.floor(Number * multiplyWith) / multiplyWith;
    };
    return IndexFile;
}());
exports.IndexFile = IndexFile;
//# sourceMappingURL=indexFile.js.map