"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var ElectronPath = path.join(__dirname, "..");
require('electron-reload')(ElectronPath, {
    electron: path.join(ElectronPath, 'node_modules', '.bin', 'electron.cmd')
});
electron_1.ipcMain.on("saveDialog", function (event) {
    var res = electron_1.dialog.showSaveDialogSync({
        title: "Choose where the file should be saved"
    });
    event.sender.send("saveDialogFinished", [res]);
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
        width: 800
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(ElectronPath, "HTML/index.html"));
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
//# sourceMappingURL=app.js.map