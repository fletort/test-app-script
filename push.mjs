import fs from 'fs-extra';
import {globbySync} from 'globby';
import replace from 'replace';
import {execSync} from 'child_process';
import {program} from 'commander';

program
  .name('myclasp')
  .description('Use appscript CLI with local code management');

program.command('push')
  .description('Update the remote project managing local code')
  .option('-f, --force', 'Forcibly overwrites the remote manifest.')
  .action((options) => push(options));

program.command('pull')
  .description('Fetch a remote project managing local code')
  .option('--versionNumber <version>', 'The version number of the project to retrieve.')
  .action((options) => pull(options));

program.parse(process.argv);

function getSyncFiles() {
    var ignores = fs.readFileSync('.claspignore').toString().replace(/\r/g,"").split("\n").filter((value) => value != '');
    const patterns = ignores.map((value) => {
        if (value[0] == '!') {
            return value.slice(1);
        } else {
            return '!' + value;
        }
    });
    const filePaths = globbySync(patterns);
    // console.log(filePaths);
    return filePaths;
}

function comment(filePaths) {
    replace({
        regex: /\/\/ COMMENT THIS BLOCK IN GASP - START\r*\n(([^\n]+\n)+)\/\/ COMMENT THIS BLOCK IN GASP - END\r*\n/,
        replacement: "/* COMMENT THIS BLOCK IN GASP - START\n$1COMMENT THIS BLOCK IN GASP - END */\n",
        paths: filePaths,
        recursive: true,
        silent: true
    });
}

function unComment(filePaths) {
    replace({
        regex: /\/\* COMMENT THIS BLOCK IN GASP - START\n(([^\n]+\n)+)COMMENT THIS BLOCK IN GASP - END \*\/\n/,
        replacement: "// COMMENT THIS BLOCK IN GASP - START\n$1// COMMENT THIS BLOCK IN GASP - END\n",
        paths: filePaths,
        recursive: true,
        silent: true
    });
}

function push(options) {
    const filePaths = getSyncFiles();
    comment(filePaths);
    
    let args = "";
    if (options.force) {
        args = " -f";
    }
    
    let output = execSync(`clasp push${args}`);
    console.log(`${output}`);

    unComment(filePaths);
}

function pull(options) {
    const filePaths = getSyncFiles();

    let args = "";
    if (options.versionNumber) {
        args = ` --versionNumber ${options.versionNumber}`;
    }

    let output = execSync(`clasp pull${args}`);
    console.log(`${output}`);
    unComment(filePaths);  
}


// // DO THE JOB
// let output = execSync("clasp push");
// console.log(`${output}`);





