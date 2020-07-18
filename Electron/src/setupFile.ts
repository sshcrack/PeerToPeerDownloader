import { ipcRenderer } from "electron";
import * as Storage from "electron-store";

export class SetupFile {
    private storage = new Storage();

    public init() {
        window.onload = () => {
            let $ = require("jquery");

            $("#pasteClipboard").on("click", () => {
                //@ts-ignore
                document.querySelector("#host").value = this.readClipboard();
            })

            $("#setHost").on("click", () => {
                location.pathname = location.pathname.replace("setup.html", "index.html");
                //@ts-ignore
                this.storage.set("host", document.querySelector("#host").value);
            });
        }

    }

    private readClipboard() {
        return ipcRenderer.sendSync("readClipboard");
    }
};