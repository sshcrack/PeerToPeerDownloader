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
exports.DownloadManager = void 0;
var http = require("http");
var https = require("https");
var fs = require("fs");
var events = require("events");
var DownloadManager = /** @class */ (function () {
    function DownloadManager(file) {
        this.serverHost = "192.168.178.49:8080";
        this.emitter = new events.EventEmitter();
        this.paused = false;
        this.wasPaused = false;
        this.pausedOnce = false;
        this.started = false;
        this.downloaded = 0;
        this.checkedSize = false;
        this.file = file;
    }
    DownloadManager.prototype.pause = function () {
        this.wasPaused = true;
        this.pausedOnce = true;
        this.emitter.emit("pause");
    };
    DownloadManager.prototype.resume = function () {
        this.emitter.emit("resume");
    };
    DownloadManager.prototype.download = function () {
        this.emitter.emit("download");
    };
    DownloadManager.prototype.close = function () {
        this.emitter.emit("close");
    };
    DownloadManager.prototype.getEmitter = function () {
        var _this = this;
        var emitter = this.emitter;
        emitter.on("download", function () { return __awaiter(_this, void 0, void 0, function () {
            var file, fileName, url, _a, size, roundDecimalPlace, exists, saveTo, response;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Downloading");
                        file = this.file;
                        fileName = this.file.filename;
                        url = this.file.url;
                        if (!!this.checkedSize) return [3 /*break*/, 2];
                        console.log("Getting size...");
                        _a = this.file;
                        return [4 /*yield*/, this.getSize(url)];
                    case 1:
                        _a.size = _b.sent();
                        console.log("Size is", this.file.size);
                        this.checkedSize = true;
                        _b.label = 2;
                    case 2:
                        if (this.downloaded == this.file.size)
                            return [2 /*return*/];
                        console.log(".");
                        size = this.file.size;
                        roundDecimalPlace = this.roundDecimalPlace;
                        if (!this.started) {
                            exists = fs.existsSync(fileName);
                            if (exists)
                                fs.unlinkSync(fileName);
                            this.started = true;
                        }
                        saveTo = fs.createWriteStream(fileName, {
                            flags: "a"
                        });
                        return [4 /*yield*/, this.getResponse("http://" + this.serverHost + "/downloadFile?url=" + url, this.file.startFrom)];
                    case 3:
                        response = _b.sent();
                        if (this.pausedOnce) {
                            if (response.statusCode != 206) {
                                response.destroy();
                                emitter.emit("error", [{ stack: "Resuming is not supported by this webserver.", code: 1 }]);
                                return [2 /*return*/];
                            }
                        }
                        response.pipe(saveTo);
                        response.on("data", function (chunk) {
                            _this.downloaded += chunk.length;
                            var perCent = undefined;
                            if (size != undefined) {
                                perCent = roundDecimalPlace(((_this.downloaded + (file.startFrom == undefined ? 0 : file.startFrom)) / size) * 100, 2);
                            }
                            emitter.emit("progress", [perCent, _this.downloaded, chunk.length]);
                        });
                        response.on("error", function (err) {
                            emitter.emit("errorOccurred", [err]);
                        });
                        saveTo.on('close', function () {
                            emitter.emit("finished");
                            saveTo.close();
                        });
                        emitter.on("pause", function () {
                            if (!_this.paused) {
                                response.pause();
                                _this.paused = true;
                            }
                        });
                        emitter.on("resume", function () {
                            if (_this.paused) {
                                response.resume();
                                _this.paused = false;
                            }
                        });
                        emitter.on("close", function () {
                            response.destroy();
                            saveTo.close();
                        });
                        return [2 /*return*/];
                }
            });
        }); }).on('error', function (err) {
            emitter.emit("errorOccurred", [err]);
        });
        return emitter;
    };
    DownloadManager.prototype.getResponse = function (url, range) {
        if (range === void 0) { range = undefined; }
        return new Promise(function (resolve, reject) {
            if (range == undefined) {
                http.get(url, function (response) {
                    resolve(response);
                });
                return;
            }
            console.log("Range");
            http.get(url, {
                headers: {
                    range: "bytes=" + range + "-"
                }
            }, resolve);
        });
    };
    DownloadManager.prototype.roundDecimalPlace = function (Number, place) {
        var multiplyWith = Math.pow(10, place);
        return Math.floor(Number * multiplyWith) / multiplyWith;
    };
    DownloadManager.prototype.getSize = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = { method: 'HEAD' };
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
            req.end();
        });
    };
    DownloadManager.prototype.isNumber = function (Number) {
        return !isNaN(Number);
    };
    return DownloadManager;
}());
exports.DownloadManager = DownloadManager;
//# sourceMappingURL=downloadManager.js.map