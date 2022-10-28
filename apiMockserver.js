var fs = require('fs');
var path = require('path');

const apiPrehandler = require('./apiPrehandler.js');
const ApiLoader = require('./ApiLoader.js');
// Mock Server--------------------------------------------------------



const loadApi = function (app, apiLoadObj) {

    if (apiLoadObj.disabled) {
        // 已關閉該API暫時不載入
        return;
    }

    // 載入apiRoute------------------------------------------------
    // const apiRoute = apiLoadObj.loadApiRoute();

    console.log(`load api [${apiLoadObj.apiType}]${apiLoadObj.apiRoute}`);

    // 處理參照型的API(暫時不支援)------------------------------------------------
    // apiLoadObj.refApiHandle();

    // 裝載預處理(暫時不支援)-----------------------------------------------
    // apiLoadObj.prehandleHandle();

    // 安裝this要用到的參數-----------------------------------------------
    apiLoadObj.installApiObjParam();
    // // 裝在handle裡面要用的this參數
    // apiObj.rootPath = __dirname;

    // 生成API處理函式-----------------------------------------------
    const apiHandle = apiLoadObj.genApiHandle();

    // API 開始傾聽-----------------------------------------------
    apiLoadObj.apiListen(app, apiHandle);
}


const importApi = function (app, fileNameList, apiFolderConfig) {

    const rootFilePath = apiFolderConfig.path;

    // rootFilePath: './testApi'
    fileNameList.forEach((fileName) => {
        let apiFilePath = path.join(__dirname, rootFilePath);
        apiFilePath = path.join(apiFilePath, '/' + fileName);
        let apiObj = require(apiFilePath);

        // ==========================================================

        // rootApiPath, rootFilePath,
        // const apiRoot = apiFolderConfig.apiPrefix;
        // const folderPath = apiFolderConfig.path;

        let apiLoadObj = new ApiLoader(apiObj, fileName, apiFilePath, apiFolderConfig);

        loadApi(app, apiLoadObj);
    });
}

const importApiFolderConfig = function (app, apiFolderConfig) {
    // const apiRoot = apiFolderConfig.apiPrefix;
    const folderPath = apiFolderConfig.path;
    // apiRoot: '/api'
    // folderPath: './testApi'
    let fileNameList = fs.readdirSync(path.join(__dirname, folderPath));

    // console.log('fileNameList', fileNameList);

    fileNameList = fileNameList.filter((fileName) => {
        // 只取js檔(篩掉資料夾、或其他檔案)
        return /\.js$/.test(fileName);
    });
    // const apiApiOption = {
    //     prehandleList: apiPrehandler.getPrehandleList(apiFolderConfig),
    // };
    importApi(app, fileNameList, apiFolderConfig);
};

const runMockserver = function (app, apiFolder) {
    apiFolder.forEach((apiFolderConfig) => {
        // apiFolderInfo.apiPrefix: '/testApi'
        // apiFolderInfo.path: './api'
        // importApiFolder(app, apiFolderInfo.apiPrefix, apiFolderInfo.path);
        importApiFolderConfig(app, apiFolderConfig);

        let port = apiFolderConfig.port || 8000;
        app.listen(port, function () {
            console.log(`Server api ${apiFolderConfig.apiPrefix} listening on port ${port}`);

            // if (process.env.DEPLOY_MODE) {
            //     console.log('\x1b[33m %s\x1b[0m', `server is run on node: ${process.env.DEPLOY_MODE}`);
            // }
        });
    });
}



/* 可對應多個route的範例
// if (apiRoute === '/msp0605/:fileKey') {
//     console.log('/msp0605/:fileKey');
// }
app.get('/foo/bar/:slug',
    function(req, res, next) {
        console.log(req.params.slug);
        next();
    }
); */

module.exports = {
    run: runMockserver,
};
