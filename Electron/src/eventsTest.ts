import { DownloadManager } from "./downloadManager";
import { File } from "./file";

let example = new File();
example.filename = "C:/Users/Hendrik/Downloads/test.png";
example.url = "http://kleintierpraxis-meppen.de/Eltech/blog/Meine%20Bilder/imgs/img0full.png";


let manager = new DownloadManager(example);
let emitter = manager.getEmitter();

emitter.on("progress", args => {
});

emitter.on("error", err => {
    console.error(err[0].stack);
})


manager.download();

setTimeout(() => manager.pause(), 500);
setTimeout(() => manager.resume(), 1000);
setTimeout(() => manager.pause(), 1500);
setTimeout(() => manager.resume(), 2000);