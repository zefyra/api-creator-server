
// 用res.react 來替代 res.json
function react(req, res, json) {
    if (!json) {
        json = {};
    }
    // 自動補上result欄位
    if (json.result === undefined) {
        json.result = true; // 預設是回傳成功
    }
    return res.json(json);
}

function jsonReact(req, res, obj) {
    return res.json(obj);
}

function rawReact(req, res, str) {
    return res.send(str);
    // return res.json(json);
}

function restReact(req, res, data = null) {
    return res.json({
        code: "0", // 0代表成功
        data: data,
        msg: "ok",
    });
}

// 處理底層error
function refuse(req, res, error, data) {
    return res.json({
        code: "1", // 1代表通用失敗
        data: data ? data : null,
        msg: error,
    });
}

module.exports = class ApiLoader {
    // importApi()的參數
    fileName = '';
    apiFilePath = '';

    // apiFolderConfig的參數
    rootApiPath = '';
    rootFilePath = '';
    port = 8099;

    // apiObj的參數
    disabled = false;
    apiType = '';
    reactType = '';

    middleware = null; // 目前不支援

    handle = null;

    constructor(apiObj, fileName, apiFilePath, apiFolderConfig) {
        this.apiObj = apiObj;

        // importApi()的參數
        this.fileName = fileName;
        this.apiFilePath = apiFilePath;

        // apiFolderConfig的參數
        this.rootApiPath = apiFolderConfig.apiPrefix;
        this.rootFilePath = apiFolderConfig.path;
        this.port = apiFolderConfig.port;

        // apiObj的參數
        if (apiObj.disabled) {
            this.disabled = apiObj.disabled;
        }

        this.apiType = apiObj.apiType;
        this.reactType = apiObj.reactType;

        this.apiRoute = this.loadApiRoute(this.fileName);

        this.middleware = apiObj.middleware;

        this.handle = apiObj.handle;
    }
    loadApiRoute(fileName) {
        // fileName: 'getBoardList.js'

        // 代表有指定apiRoute
        if (this.apiObj.apiRoute) {
            return this.apiObj.apiRoute;
        }

        let apiName = fileName.replace(/\.js$/g, ''); // 去除尾段的 '.js'
        apiName = apiName.replace(/^[0-9]{1,4}/g, ''); // 去除開頭的數字
        return this.rootApiPath + '/' + apiName;
        // apiRoute: '/api/getBoardList'
    }

    // 處理參照型的API (目前不使用)
    refApiHandle() {
        /*
    if (apiObj.apiType === 'ref') {
        // 代表參照其他API
        apiObj = require(path.join(__dirname, apiObj.refFile));
    } else if (apiObj.apiType === 'proxyRef') {

        const proxyHandle = apiObj.proxyHandle;

        const originApiObj = apiObj;

        apiObj = require(path.join(__dirname, apiObj.refFile));

        if (originApiObj.reactType) {
            // 若originApiObj有設定reactType，則要設禁
            apiObj.reactType = originApiObj.reactType;
        }

        apiObj = Object.assign({}, apiObj);

        const refHandle = apiObj.handle;
        function mixHandle(req, res) {
            if (proxyHandle) {
                return this.proxyHandle.call(apiObj, req, res, refHandle);
            } else {
                return this.refHandle(req, res);
            }
        }

        apiObj.handle = mixHandle.bind({
            refHandle: refHandle,
            proxyHandle: proxyHandle,
        });

    } else if (apiObj.apiType === 'dummyProxy') {

        // const dummyProxyInfo = apiObj;

        // 代表是用來造假的代理伺服器
        apiObj = DummyProxyHelper.getDummyProxyApiObj(apiObj, apiRoute);

        // apiObj = require(path.join(__dirname, "./api/0007genFakeApi.js"));
    } */
    }

    // 裝載預處理 (目前不使用)
    prehandleHandle() {
        /*
    // 裝載預處理
    if (apiObj.prehandleMap) {
        // 代表有客製化prehandle，
        apiObj.prehandleList = apiPrehandler.getPrehandleListByMap(apiObj.prehandleMap);
    } else if (option.prehandleList) {
        // 裝載預設的預處理
        apiObj.prehandleList = option.prehandleList;
    }*/
    }


    installApiObjParam() {
        // 裝在handle裡面要用的this參數
        this.apiObj.rootPath = __dirname;
    }

    genApiHandle() {
        return this.apiHandle.bind(this);
    }

    // 安裝回應函式
    installReact(req, res) {

        // 設定react: 塞入回傳用的函式------------------------------------

        if (this.reactType === 'json') {
            res.react = jsonReact.bind(null, req, res);
        } else if (this.reactType === 'raw') {
            res.react = rawReact.bind(null, req, res);
        } else if (this.reactType === 'rest') {
            res.react = restReact.bind(null, req, res);
        } else {
            console.error(`reactType not support`);

            // 預設的react
            res.react = react.bind(null, req, res);
        }

        // 設定refuse: 處理error用的-----------------------------------------------------
        res.refuse = refuse.bind(null, req, res);
    }


    async apiHeaderPrehandle(req, res) {
        const apiObj = this.apiObj;

        /* // 目前不支援prehandle
        if (apiObj.prehandleList) {
            // 代表有需要前置處理
            for (let i = 0; i < apiObj.prehandleList.length; i += 1) {

                if (typeof apiObj.prehandleList[i] === 'function') {
                    await apiObj.prehandleList[i].apply(apiObj, [req, res]);
                }
            }

            // 代表該API有設定preRequestScript
            if (apiObj.preRequestScript) {
                await apiObj.preRequestScript.apply(apiObj, [req, res]);
            }

            return Promise.resolve();
        } */

        // 沒有額外處理
        return Promise.resolve();
    }


    // 目前不支援
    async handleApiMiddleware(req) {
        // const apiObj = this.apiObj;
        // const middlewareKeyList = apiObj.middleware;

        // // middlewareKeyList: ['urlQuery']

        // for (let middlewareKey of middlewareKeyList) {
        //     if (middlewareKey === 'urlQuery') {
        //         await urlQuery(apiObj, req);
        //     }
        // }

        return;
    }

    apiHandle(req, res) {
        // API呼叫時會從這裡進來

        const vm = this;

        // 安裝回應函式
        this.installReact(req, res);

        // prehandleList--------------------------------
        return this.apiHeaderPrehandle(req, res).then(() => {

            // Middleware--------------------------------
            if (!vm.middleware) {
                return Promise.resolve();
            }
            return vm.handleApiMiddleware(req);
        }).then(() => {

            // 主要的API處理位置
            // return apiObj.handle(req, res);
            return this.handle(req, res);
        }).catch((error) => {
            console.error('apiError', error);

            return res.json({
                result: false,
                message: `${error}`,
            });
        });
    }

    apiListen(app, apiHandle) {
        // const apiObj = this.apiObj;

        const apiRoute = this.apiRoute;

        if (this.apiType === 'post') {
            app.post(apiRoute, apiHandle);
        } else if (this.apiType === 'get') {
            app.get(apiRoute, apiHandle);
        } else if (this.apiType === 'raw') {
            app.post(apiRoute, apiHandle);
            // 這些目前不支援
            // } else if (apiObj.apiType === 'postFormData') {
            //     app.post(apiRoute, upload.array(), apiHandle);
            // } else if (apiObj.apiType === 'postMulterFile') {
            //     // 這裡會設定要讀取檔案的欄位
            //     app.post(apiRoute, uploadFile.single('file'), apiHandle);
        } else {
            console.error('apiTypeNotSupport');
        }
    }
}