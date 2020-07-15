const inquirer = require("inquirer");
const ora = require('ora');
const { spawn } = require('child_process');
const path = require('path');
const packager = require('electron-packager');
const chalk = require('chalk');
const fs = require('fs');
const meow = require('meow');
const glob = require('glob');
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

if(input == "pack") {
  inquirer.prompt([{
    name: "toDeploy",
    message: "Do you want to be Electron packaged? \r\n Everything in the packaging directory will get deleted.",
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

        let files = glob.sync(electronOut + "**/**");

        let deletingFiles = getSpinner("Deleting files...");
        deletingFiles.start();

        files.forEach(file => {
          deletingFiles.text = `Deleting ${file}...`;
<<<<<<< HEAD
          let stat = fs.statSync(file);
          if(stat.isFile()) {
            fs.unlinkSync(file);
          }
=======
          fs.unlinkSync(file);
>>>>>>> 8d43e9f4c894bc034802f38df57d83d9ace7cf82
        });

        deletingFiles.stop();

        if(!fs.existsSync(electronOut)) {
          fs.mkdirSync(electronOut);
<<<<<<< HEAD
        } else {
          fs.rmdirSync(electronOut, {recursive: true});
          fs.mkdirSync(electronOut);
=======
>>>>>>> 8d43e9f4c894bc034802f38df57d83d9ace7cf82
        }

        let spinner = getSpinner("Packaging...");
        spinner.start();

        packager({
          dir: electronSource,
          out: electronOut,
          platform: toPackage.Os,
          arch: "all",
          quiet: true
<<<<<<< HEAD
        }).then(() => {
          spinner.stop();
          console.log(chalk.cyan("-") + chalk.white(` Electron was packaged to ` + chalk.green(path.resolve(electronOut))));
=======
        }, () => {
          spinner.stop();
          console.log(chalk.cyan("-") + chalk.white(` Electron was packaged to` + chalk.green(path.resolve(electronOut))));
>>>>>>> 8d43e9f4c894bc034802f38df57d83d9ace7cf82
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

function existsArray(array, searchFor) {
  return array.indexOf(searchFor) != -1;
}