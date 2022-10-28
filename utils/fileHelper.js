const util = require('util');
const fs = require('fs');
const path = require('path');

module.exports = {
    checkPathExist: async function (inputPath) {

        const exist = fs.existsSync(inputPath);
        return Promise.resolve(exist);

        // stats = await util.promisify(fs.stat)(inputPath);
        // return stats.isFile();
        /*
        return new Promise((resolve, reject) => {
            fs.access(inputPath, fs.constants.F_OK, (err) => {
                // console.log(`${inputPath} ${err ? '不存在' : '存在'}`);
                return resolve(err == null);
            });
        });*/
    },
    writeFile: function (filePath, strContent) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, strContent, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    console.log(err);
                    reject(err);
                    return;
                }

                console.log("JSON file has been saved.");
                resolve();
            });
        });
    },
    readJsonFile: function (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                let obj;
                try {
                    obj = JSON.parse(data);
                } catch (e) {
                    reject('json parse fail');
                    return
                }

                resolve(obj);

                // let obj = JSON.parse(data);
                // console.log('obj', obj);
                // if (isNaN(obj)) {
                //     reject('json parse fail');
                //     return;
                // }
                // resolve(obj);
                // return;
                // console.log(student);
            });
        });
    }
}