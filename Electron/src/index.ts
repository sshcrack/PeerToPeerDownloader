import { app, BrowserWindow, clipboard, dialog, FileFilter, ipcMain, SaveDialogSyncOptions } from "electron";
import * as Store from "electron-store";
import * as path from "path";
let ElectronPath = path.join(__dirname, "..");
let icon = path.join(ElectronPath, "icon.ico");

const store = new Store();

let windows : BrowserWindow[] = [];

console.log("Starting Electron...");

require('electron-reload')(ElectronPath, {
  electron: path.join(ElectronPath,  'node_modules', '.bin', 'electron.cmd')
});


ipcMain.on("saveDialog", (event, args) => {

  let options :SaveDialogSyncOptions = {
    title: "Choose where the file should be saved"
  }

  if(args[0] != undefined) {
    options.defaultPath = path.basename(args[0]);
    console.log("ExtName", path.extname(args[0]));

    let filterSpecific : FileFilter = {
      extensions: [path.extname(args[0]).substr(1)],
      name: path.extname(args[0])
    }

    let filterAll : FileFilter = {
      extensions: ["*"],
      name: "All Files"
    }

    if(options.filters == undefined) options.filters = [];

    options.filters.push(filterSpecific);
  }

  let res = dialog.showSaveDialogSync(options)
  event.sender.send("saveDialogFinished", [res]);
});

ipcMain.on("quit", () => {
  windows.forEach(window => window.close());
})

ipcMain.on("readClipboard", (event) => {
  event.returnValue = clipboard.readText();
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
    icon: icon,
    title: "peer-to-peer Downloader"
  });

  mainWindow.setMenuBarVisibility(false);

  windows.push(mainWindow);

  let host = store.get("host");
  if(host == undefined) {
    mainWindow.loadFile(path.join(ElectronPath, "HTML/setup.html"));
  } else {
    mainWindow.loadFile(path.join(ElectronPath, "HTML/index.html"));
  }

  // and load the index.html of the app.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});