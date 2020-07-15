import { File } from "./file";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as events from "events";
import * as Storage from "electron-store";


export class DownloadManager {
    private file : File;
    private serverHost = new Storage().get("host");
    private emitter = new events.EventEmitter();
    public paused = false;
    private wasPaused = false;
    private pausedOnce = false;
    private started = false;
    private downloaded = 0;

    private checkedSize = false;
    constructor (file : File) {
        this.file = file;
    }

    public pause() {
        this.wasPaused = true;
        this.pausedOnce = true;
        this.emitter.emit("pause");
    }

    public resume() {
        this.emitter.emit("resume");
    }

    public download() {
        this.emitter.emit("download");
    }

    public close() {
        this.emitter.emit("close");
    }

    public getEmitter() : events.EventEmitter {
        let emitter = this.emitter;
        emitter.on("download", async () => {
            console.log("Downloading");
            let file = this.file;
            let fileName = this.file.filename;
            let url = this.file.url;
            if(!this.checkedSize) {
                console.log("Getting size...");
                this.file.size = await this.getSize(url);
                console.log("Size is", this.file.size);
                this.checkedSize = true;
            }

            if(this.downloaded == this.file.size) return;

            console.log(".");

            let size = this.file.size;
            let roundDecimalPlace = this.roundDecimalPlace;

            if(!this.started) {
                let exists = fs.existsSync(fileName)
                if(exists) fs.unlinkSync(fileName);
                this.started = true;
            }

            const saveTo = fs.createWriteStream(fileName, {
                flags: "a"
            });

            let response = await this.getResponse(`http://${this.serverHost}/downloadFile?url=${url}`, this.file.startFrom );

            if(this.pausedOnce) {
                if(response.statusCode != 206) {
                    response.destroy();
                    emitter.emit("error", [{stack: "Resuming is not supported by this webserver.", code: 1}])
                    return;
                }
            }

            response.pipe(saveTo);

            response.on("data", (chunk : Buffer) => {
                this.downloaded += chunk.length;

                let perCent = undefined;

                if(size != undefined) {
                    perCent = roundDecimalPlace(((this.downloaded + (file.startFrom == undefined ? 0 : file.startFrom) ) / size) * 100, 2)
                }

                emitter.emit("progress", [perCent, this.downloaded, chunk.length]);
            });

            response.on("error", err => {
                emitter.emit("errorOccurred", [err])
            })

            saveTo.on('close', () => {
                emitter.emit("finished");
                saveTo.close();
            });

            emitter.on("pause", () => {
                if(!this.paused) {
                    response.pause();
                    this.paused = true;
                }
            });

            emitter.on("resume", () => {
                if(this.paused) {
                    response.resume();
                    this.paused = false;
                }
            });

            emitter.on("close", () => {
                response.destroy();
                saveTo.close();
            })
        }).on('error', function(err) {
            emitter.emit("errorOccurred", [err]);
        });

        return emitter;
    }

    private getResponse(url : string, range : number = undefined) : Promise<http.IncomingMessage> {
        return new Promise((resolve, reject) => {

            if(range == undefined) {
                http.get(url, response => {
                    resolve(response);
                });
                return;
            }

            console.log("Range");

            http.get(url, {
                headers: {
                    range: `bytes=${range}-`
                }
            }, resolve)
        });
    }

    private roundDecimalPlace(Number : number ,place : number) {
        let multiplyWith = Math.pow(10, place);
        return Math.floor(Number * multiplyWith) / multiplyWith;
    }

    private getSize(url : string) : Promise<number | undefined> {
        return new Promise((resolve, reject) => {
          var options = {method: 'HEAD'};

          let requestHandle = (res : http.IncomingMessage) => {
            let length : string = res.headers["content-length"];
            if(this.isNumber(length)) {
              resolve(parseInt(length));
              return;
            }

            resolve(undefined);
          }
          let req;

          if(url.startsWith("http://")) req = http.request(url, options, requestHandle);
          if(url.startsWith("https://")) req = https.request(url, options, requestHandle);

          req.end();
        });
    }

    private isNumber(Number : any) {
        return !isNaN(Number);
    }
}