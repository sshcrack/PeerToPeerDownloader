import { ipcRenderer } from "electron"
import { File } from "./file";
import * as async from "async";
import * as http from "http"
import * as https from "https"
import * as path from "path"
import * as fs from "fs";
import { DownloadManager } from "./downloadManager";

export class IndexFile {

  constructor() {};
  public init() {

    window.onload = () => {

      //@ts-ignore
      fitty("#downloading");

      const $ = require("jquery");


      let files: File[] = [];
      let downloadActive = false;

      $("#saveAs").on("click", () => {
        let urlElement: any = document.querySelector("#fileUrl");
        let url: string = urlElement.value;

        if (url == "" || url == undefined) {
          this.saveDialog();
          return;
        }

        let fileName = url.split("/").pop();

        this.saveDialog(fileName);
      })

      $("#pasteClipboard").on('click', () => {
        let clipboard = this.readClipboard();
        let input: any = document.querySelector("#fileUrl");
        input.value = clipboard;
      })

      $("#add").on('click', () => {
        let filesList = document.querySelector("#filesList");

        let pathElement: any = document.querySelector("#FilePath");
        let urlElement: any = document.querySelector("#fileUrl");
        let filePath: string = pathElement.value;
        let url: string = urlElement.value;

        let child = document.createElement("li");
        child.setAttribute("addListID", files.length.toString());
        child.className = "list-group-item d-flex flex-row justify-content-center";

        if (filePath == "" || url == "") {
          alert("Enter a path/url");
          return;
        }


        child.innerHTML = `
            <span class="url text-dark">${url.split("/")[url.split("/").length -1]}</span>
            <div class="mx-1"></div>
            <i class="fas fa-arrow-right my-auto mx-2"></i>
            <span class="path text-black-50">${path.basename(filePath)}</span>
            <div class="progress m-auto" id="progressBarParent">
              <div class="progress-bar noTransition" role="progressbar" style="width: 0%;" addID="${files.length}"></div>
            </div>
          `

        //@ts-ignore
        fitty(".url");

        //@ts-ignore
        fitty(".path");

        let file: File = new File();
        file.filename = filePath;
        file.url = url;
        file.index = files.length;

        let index = files.push(file);

        let X: any = document.createElement("button");
        X.className = "my-auto close";
        X.innerHTML = "&times;"
        X.addEventListener('click', () => {
          files.splice(index, 1);
          child.remove();
        });

        child.appendChild(X);

        filesList.appendChild(child);


        pathElement.value = "";
        urlElement.value = "";
      });

      let currentFile: File;
      let paused = false;

      window.onbeforeunload = (event: BeforeUnloadEvent) => {
        if (!downloadActive) {
          return;
        }

        let preventClosingButton: any = document.querySelector("#preventClosingButton");
        preventClosingButton.click();
        let quit = document.querySelector("#quit");
        quit.addEventListener("click", () => {
          downloadActive = false;
          ipcRenderer.send("quit");
        });

        event.preventDefault();
        return true;
      }

      $("#download").on("click", async () => {
        let downloadButton = document.getElementById("download");
        let fileLabel = document.querySelector("#downloading");
        let downloadProgress: any = document.querySelector("#downloadProgress")
        downloadProgress.style = "display: inherit !important";
        fileLabel.innerHTML = `Fetching download sizes... (0 from ${files.length})`

        downloadActive = true;
        downloadButton.setAttribute("disabled", "moino");

        let processed = 0;
        let totalSize = 0;
        let totalDownloaded = 0;

        async.each(files, async (file, callback) => {

          this.getSize(file.url).then(size => {

            file.size = size;
            processed += 1;

            totalSize += file.size == undefined ? 0 : file.size;

            fileLabel.innerHTML = `Fetching download sizes... (${processed} from ${files.length})`

            callback();
          }).catch(err => {
            alert(err.error);
            let index = files.indexOf(file);
            if(index != -1) files.splice(index, 1);

            let displayed = $(`[addListID="${file.index}"]`)[0]
            displayed.remove();

            callback();
          })
        }, err => {
          fileLabel.innerHTML = `Starting to download....`;
          let fileProgress = document.querySelector("#fileProgress");

          async.each(files, async (file, callback) => {
            let splitted = file.url.split("/");
            fileLabel.innerHTML = `Downloading ${splitted[splitted.length -1]}...`
            let manager = new DownloadManager(file);
            let emitter = manager.getEmitter();
            file.manager = manager;
            currentFile = file;
            manager.download();

            let bar = $(`[addID="${file.index}"]`)[0]

            let getMBits = () => {
              if (file.finished) return;
              if (file.manager.paused) {
                setTimeout(getMBits, 1000);
                return;
              }


              let difference = currentDownload - lastDownload;
              lastDownload = currentDownload;
              let mbits = this.roundDecimalPlace(difference / 1000 / 1000, 2);
              bar.innerHTML = mbits + " MB/s";

              setTimeout(getMBits, 1000);
            };

            let lastDownload = 0;
            let currentDownload: number = 0;

            setTimeout(getMBits, 1000);

            emitter.on("progress", args => {
              let percent = args[0];
              if (percent != undefined) {
                bar.style = `width: ${percent}%;`;

                bar.classList.toggle("progress-bar-striped", false);
                bar.classList.toggle("progress-bar-animated", false);

                let chunk: number = args[2];
                currentDownload += chunk;
                totalDownloaded += chunk;

                let total = this.roundDecimalPlace(totalDownloaded / totalSize * 100, 2);

                //@ts-ignore
                fileProgress.style = `width: ${total}%;`
                fileProgress.innerHTML = total + "%";
                return;
              }

              bar.style.width = "100%";
              bar.innerHTML = (args[1] / 1000 / 1000) + " MB";
              bar.classList.toggle("progress-bar-striped", true);
              bar.classList.toggle("progress-bar-animated", true);
            });

            emitter.on("finished", () => {
              bar.classList.toggle("bg-success", true);
              bar.innerHTML = "Finished";
              file.finished = true;
              callback();
            })

            emitter.on("error", args => {
              let err = args[0];
              bar.classList.toggle("bg-danger", true);
              bar.innerHTML = "Error";
              fs.appendFile("./errors.txt", err.stack, () => {});

              callback();
            })
          }, err => {
            fileLabel.innerHTML = `Downloads finished!`
            downloadButton.removeAttribute("disabled");
            processed = 0;
            totalSize = 0;
            totalDownloaded = 0;
            files = [];
            let children = document.querySelector("#filesList").children;

            for (let i = 0; i < children.length; i++) {
              let child = children.item(i);
              child.remove();
            }
            downloadActive = false;
          });
        });
      })

      $("#pause").on("click", () => {
        if (currentFile == undefined) return;
        if (paused) {
          currentFile.manager.resume()
          $("#pause")[0].innerHTML = "Pause"
        } else {
          currentFile.manager.pause();
          $("#pause")[0].innerHTML = "Resume"
        }

        paused = !paused;
      });

      this.ipcRendererInit();
    };
  }

  private saveDialog(fileName ? : string) {
    ipcRenderer.send("saveDialog", [fileName]);
  }

  private readClipboard() {
    return ipcRenderer.sendSync("readClipboard");
  }

  private ipcRendererInit() {
    ipcRenderer.on("saveDialogFinished", (event: any, args: any) => {
      if (args == null) return;

      let pathInput: any = document.querySelector("#FilePath");

      pathInput.value = args;
    })
  }

  private getSize(url: string): Promise < number | undefined > {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'HEAD'
      };

      let requestHandle = (res: http.IncomingMessage) => {
        let length: string = res.headers["content-length"];
        if (this.isNumber(length)) {
          resolve(parseInt(length));
          return;
        }

        resolve(undefined);
      }
      let req;

      if (url.startsWith("http://")) req = http.request(url, options, requestHandle);
      if (url.startsWith("https://")) req = https.request(url, options, requestHandle);

      if(req != null) {
        req.end();
      } else {
        reject({error: "Not a valid url"});
      }

    });
  }

  private isNumber(Number: any) {
    return !isNaN(Number);
  }

  private roundDecimalPlace(Number: number, place: number) {
    let multiplyWith = Math.pow(10, place);
    return Math.floor(Number * multiplyWith) / multiplyWith;
  }
}