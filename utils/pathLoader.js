
const path = require('path');
const fs = require('fs');

// module.exports = {
//     loadPathFileList: function (folderPath) {
//         // path.join(__dirname, folderPath)
//         let fileNameList = fs.readdirSync(folderPath);
//         fileNameList = fileNameList.filter((fileName) => {
//             // 只取js檔(篩掉資料夾、或其他檔案)
//             return /\.js$/.test(fileName);
//         });
//         return fileNameList;
//     }
// }

module.exports = class PathLoader {
    folderPath = null;
    filter = null;
    fileInfoList = null;
    readFileFunc = null;
    constructor(folderPath, filter) {
        this.folderPath = folderPath;
        if (filter) {
            this.filter = filter;
        } else {
            this.filter = this.defaultFilter;
        }
    }

    defaultFilter(fileName) {
        // 只取js檔(篩掉資料夾、或其他檔案)
        return /\.js$/.test(fileName);
    }

    async load() {
        const folderPath = this.folderPath;
        const vm = this;
        let fileNameList = fs.readdirSync(folderPath);
        this.fileInfoList = fileNameList.filter(this.filter).map((fileName) => {
            return {
                fileName,
                path: vm.folderPath + '/' + fileName,
            }
        });
        return this.fileInfoList;
    }

    async mapAsync(func) {

        if (!this.fileInfoList) {
            console.error(`mapAsync: fileInfoList not exist`);
            return;
        }
        if (!Array.isArray(this.fileInfoList)) {
            console.error(`mapAsync: fileInfoList not array`);
            return;
        }

        let isErr = false;
        const errHandle = (err) => {
            isErr = true;
            console.error(err)
        };

        const mapFile = async function (fileList) {
            let newList = [];

            for (let i = 0; i < fileList.length; i += 1) {
                const newFile = await func(fileList[i]).catch(errHandle);
                if (isErr) return;
                newList.push(newFile);
            }

            return newList;
        }

        // 開啟每個apiDoc檔案，確認版本
        this.fileInfoList = await mapFile(this.fileInfoList);
        if (isErr) return Promise.reject(`mapAsync fail`);
        return this.fileInfoList;
    }

    setFileLoader(func) {
        this.readFileFunc = func;
    }

    async loadEachFile(func) {
        const fileInfoList = this.fileInfoList;
        if (!fileInfoList) {
            console.error(`loadEachFile: fileInfoList not exist`);
            return;
        }
        let isErr = false;
        const errHandle = (err) => {
            isErr = true;
            console.error(err)
        };

        // 預設讀取檔案的函式
        let readFile = function (fileInfo) {
            return new Promise((resolve, reject) => {
                fs.readFile(fileInfo.path, 'utf8', function (err, data) {
                    // if (err) throw err;
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        }
        if (this.readFileFunc) { // 代表有設定讀取檔案的
            readFile = this.readFileFunc;
        }

        // 載入所有.gql檔案的字串
        for (let i = 0; i < fileInfoList.length; i += 1) {

            const fileInfo = fileInfoList[i];

            const textData = await readFile(fileInfo).catch(errHandle);
            if (isErr) return;

            await func(fileInfo, textData).catch(errHandle);
            if (isErr) return;
        }
    }
}