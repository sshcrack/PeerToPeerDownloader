const inquirer = require("inquirer");
const ora = require('ora');
const { spawn } = require('child_process');
const path = require('path');
const packager = require('electron-packager');
const chalk = require('chalk');
const fs = require('fs');
const meow = require('meow');
const zipDir = require('zip-dir');
const targz = require('targz');
const async = require('async');
const commandExists = require("command-exists");
var isWin = require('os').platform().indexOf('win') > -1;

const cli = meow(`
Usage
$ node . pack|start

Options

Examples
$ node . start     To start the Server / Client
$ node . pack      To pack the Client / Server in a ZIP-File.
`);

let input = cli.input[0];
if(input == "start") {
  inquirer
  .prompt([{
    type: "list",
    name: "toStart",
    choices: [
      "Server",
      "Electron"
    ]
  }])
  .then(answers => {
    let toStart = answers.toStart;
    let buildChild;
    let cwd = "";

    let startCommand = "";

    if (toStart == "Server") {
      startCommand = "node .";
      cwd = path.join(process.cwd(), "Server");
    }
    if (toStart == "Electron") {
      startCommand = "electron .";
      cwd = path.join(process.cwd(), "Electron");
    }
    let building = getSpinner("Building...\r\n");
    let installing = getSpinner("Installing Electron...");
    building.start();

    buildChild = spawn('npm run build', {
      cwd: cwd,
      shell: true
    });


    buildChild.on('close', (code) => {
      console.log("Closed code", code);
      building.stop();

      let nextStep = () => {
        let child = spawn(startCommand, {
          cwd: cwd,
          shell: true
        });

        child.stderr.pipe(process.stderr);
        child.stdout.pipe(process.stdout);
        process.stdin.pipe(child.stdin);

        child.on("close", code => {
          console.log(chalk.cyan("-") + chalk.white(` Process exited with code ${code}`));
        });
      };

      commandExists("electron").then(exists => {
        if (!exists) {
          inquirer.prompt([{
            name: "installElectron",
            type: "confirm",
            "message": "Electron is not installed. Do you want to do that now?"
          }]).then(answers => {
            let answer = answers.installElectron;
            if (answer) {
              installing.start();
              let npmInstall = spawn(isWin ? 'npm install electron -g' : 'sudo npm install electron -g', {
                cwd: cwd,
                shell: true
              });

              npmInstall.stdout.pipe(process.stdout);
              npmInstall.stderr.pipe(process.stderr);

              npmInstall.on("close", code => {
                installing.stop();
                console.log(chalk.cyan("-") + chalk.white(` Installation finished with code ${code}`));

                nextStep();
              });
            } else {
              console.log(chalk.cyan("-") + chalk.white(` Exiting setup`));
            }
          });
          return;
        }
        nextStep();
      });
    });
  })
  .catch(error => {
    if (error.isTtyError) {
      console.log(chalk.red("The setup couldn't be rendered :C"));
    } else {
      console.log(error.stack);
    }
  });
}

if(input == "release") {
  let releaseDir = path.join(process.cwd(), "Release");
  let electronPackaged = path.join(process.cwd(), "Electron", "packaged");
  if(!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir);

  let dirs = fs.readdirSync(electronPackaged);

  let spinner = getSpinner("Archiving Packages...");
  spinner.start();

  let run = async () => {
    for(let i = 0; i < dirs.length; i++) {
      let dir = dirs[i];

      let dirPath = path.join(electronPackaged, dir);
      let outFile = path.join(releaseDir, dir);


      spinner.text = `Archiving Package ${dir}`;
      if(dir.indexOf("-win") != -1) {
        await DirToZip(dirPath, outFile + ".zip");
      } else {
        await TarCompress(dirPath, outFile + ".tar.gz");
      }
    }

    let serverDir = path.join(process.cwd(), "Server");

    spinner.text = "Archiving the Server...";
    TarCompress(serverDir, path.join(releaseDir, "Server.tar.gz")).then(res => {
      spinner.stop();
      console.log(chalk.cyan("-") + chalk.white(` All files got archived.`));
    });
  };

  run();
}

if(input == "pack") {
  inquirer.prompt([{
    name: "toDeploy",
    message: "Do you want to be Electron packaged? \r\n Existing folders could be deleted.",
    type: "confirm"
  }]).then(async answers => {
    let answer = answers.toDeploy;

    let electronSource = path.join(process.cwd(), "Electron");
    let electronOut = path.join(electronSource, "packaged");

    if(answer) {
      inquirer.prompt([{
        name: "Os",
        type: "list",
        message: "For which OS should Electron be packaged for?",
        choices: [
          "linux",
          "win32",
          "darwin",
          "mas",
          "all"
        ]
      }]).then(toPackage => {
        if(!fs.existsSync(electronOut)) {
          fs.mkdirSync(electronOut);
        }

        let spinner = getSpinner("Packaging...");
        spinner.start();

        packager({
          dir: electronSource,
          out: electronOut,
          platform: toPackage.Os,
          arch: "all",
          icon: "./Electron/icon.ico",
          overwrite: true
        }).then(() => {
          spinner.stop();
          console.log(chalk.cyan("-") + chalk.white(` Electron was packaged to ` + chalk.green(path.resolve(electronOut))));
        });
      });
    }
  })
  .catch(error => {
    if (error.isTtyError) {
      console.log(chalk.red("The setup couldn't be rendered :C"));
    } else {
      console.log(error.stack);
    }
  });
}

function getSpinner(text) {
  let o = ora(text);
  o.spinner = "material";

  return o;
}

function DirToZip(src, out) {
  return new Promise((resolve, reject) => {
    zipDir(src, {saveTo: out}, (err, buffer) => {
      resolve(true);
    });
  });
}

function TarCompress (src, out) {
  return new Promise((resolve, reject) => {
    targz.compress({
      src: src,
      dest: out
    }, err => {
      resolve(true);
    });
  });
}