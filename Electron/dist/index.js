"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var Store = require("electron-store");
var path = require("path");
var ElectronPath = path.join(__dirname, "..");
var icon = path.join(ElectronPath, "icon.ico");
var store = new Store();
var windows = [];
console.log("Starting Electron...");
require('electron-reload')(ElectronPath, {
    electron: path.join(ElectronPath, 'node_modules', '.bin', 'electron.cmd')
});
electron_1.ipcMain.on("saveDialog", function (event, args) {
    var options = {
        title: "Choose where the file should be saved"
    };
    if (args[0] != undefined) {
        options.defaultPath = path.basename(args[0]);
        console.log("ExtName", path.extname(args[0]));
        var filterSpecific = {
            extensions: [path.extname(args[0]).substr(1)],
            name: path.extname(args[0])
        };
        var filterAll = {
            extensions: ["*"],
            name: "All Files"
        };
        if (options.filters == undefined)
            options.filters = [];
        options.filters.push(filterSpecific);
    }
    var res = electron_1.dialog.showSaveDialogSync(options);
    event.sender.send("saveDialogFinished", [res]);
});
electron_1.ipcMain.on("quit", function () {
    windows.forEach(function (window) { return window.close(); });
});
electron_1.ipcMain.on("readClipboard", function (event) {
    event.returnValue = electron_1.clipboard.readText();
});
function createWindow() {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        width: 800,
        icon: icon,
        title: "peer-to-peer Downloader"
    });
    mainWindow.setMenuBarVisibility(false);
    windows.push(mainWindow);
    var host = store.get("host");
    if (host == undefined) {
        mainWindow.loadFile(path.join(ElectronPath, "HTML/setup.html"));
    }
    else {
        mainWindow.loadFile(path.join(ElectronPath, "HTML/index.html"));
    }
    // and load the index.html of the app.
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", function () {
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=index.js.map