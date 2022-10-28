
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

    load() {
        const folderPath = this.folderPath;
        const vm = this;
        let fileNameList = fs.readdirSync(folderPath);
        return fileNameList.filter(this.filter).map((fileName) => {
            return {
                fileName,
                path: vm.folderPath + '/' + fileName,
            }
        });
    }
}