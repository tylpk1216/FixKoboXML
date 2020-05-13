const path = require('path');

const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const zipFolder = require('zip-folder');

const T = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<!DOCTYPE html>\r\n';

function walkSync(dir, filelist) {
    files = fs.readdirSync(dir);
    files.forEach(function(file) {
        let filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            filelist = walkSync(filePath + '/', filelist);
        } else {
            // only xhtml file
            if (filePath.indexOf('.xhtml') != -1) {
                filelist.push(filePath);
            }
        }
    });
    return filelist;
}

function getAllXML(folder) {
    return new Promise((resolve, reject) => {
        let files = walkSync(folder, []);
        resolve(files);
    });
}

function getZipRootFolder(folder) {
    let items = fs.readdirSync(folder);
    if (items.length == 1) {
        let filePath = path.join(folder, items[0]);
        if (fs.statSync(filePath).isDirectory()) {
            return filePath;
        }
    }
    return folder;
}

function addExtraTitle(folder, fileList) {
    return new Promise((resolve, reject) => {
        let count = 0;
        let code = 'utf-8';
        // check "<?xml" string
        let begin = T.slice(0, 5);

        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];
            let s = fs.readFileSync(file, {encoding: code});

            // lack title
            if (s.indexOf(begin) == -1) {
                let content = T + s;
                fs.writeFileSync(file, content, {encoding: code});
                console.log(file.replace(folder, ''));
                count++;
            }
        }

        resolve(count);
    });
}

function zipBook(zipRoot, zipFile) {
    return new Promise((resolve, reject) => {
        zipFolder(zipRoot, zipFile, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

async function startConvert(file) {
    let folder = path.join(__dirname, "output");
    let dstZip = path.join(__dirname, "output.epub");
    fs.emptyDirSync(folder);

    // 1. unzip
    let zip = new AdmZip(file);
    zip.extractAllTo(folder, true);

    // 2. find all xhtml
    let fileList = await getAllXML(folder);

    // 3. add title
    let count = await addExtraTitle(folder, fileList);
    console.log('Total modified files is', count);

    // 4. zip again
    let zipRoot = getZipRootFolder(folder);
    await zipBook(zipRoot, dstZip);
    return Promise.resolve(dstZip);
}

if (process.argv.length != 3) {
    console.log('Usage : FixKoboXML.exe xxx.epub');
    return;
}

let file = process.argv[2];

startConvert(file).then((dst) => {
    console.log('\nOutput : ');
    console.log(dst);
}).catch(err => {
    console.log(err);
});