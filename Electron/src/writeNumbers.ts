import * as fs from "fs";

let text = "";

for(let i = 0; i < 10000000; i++) {
    text += i + " ";
}

fs.writeFileSync("numbers.txt", text);