// All of the Node.js APIs are available in the preload process.

import { IndexFile } from "./indexFile";
import { SetupFile } from "./setupFile";

let index = location.pathname.endsWith("index.html")
let setup = location.pathname.endsWith("setup.html")

if(index) {
  new IndexFile().init();
}

if(setup) {
  new SetupFile().init();
}