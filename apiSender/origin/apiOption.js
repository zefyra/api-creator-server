import LocalAccessor from "localAccessor";
import ApiConfig from "./apiConfig"
import { getRegExp } from "./regExpDefine"
import ApiHeader from "./apiHeader"
import OutputFilter from './outputFilter'
import ApiLog from "./apiLog";
import ApiFake from "./apiFake";

export default class ApiOption {
    apiConfig = null; // apiConfig物件

    uniApiKey = "";
    requestType = "";
    innerKey = false; // [put]/auth/activate/{token} ==> {token}這樣需要取代的寫法
    /* config = {
        header: 'jwtTokenHeader',
        errorHandle: { // 統一用來設定error時的處理模式
            '404': 'none', // response為 404 時，不執行預設處理
        }
    }*/
    apiUrl = '';
    data = null;
    resData = null;
    outData = null;

    apiErrorHandler = null; // <ApiErrorHandler>

    token = null;
    header = null;

    fakeApi = null;

    constructor(apiKey, data, option = {}) {

        // 取得uniApiKey
        this.uniApiKey = this.getUniApiKey(apiKey);

        const uniApiKey = this.uniApiKey;

        // 取得所有option參數---------------------------

        // origin function: applyApiKeyOption 

        // 取得reuestType
        // ex.[get]/api/MemberGroup ===> option: { requestType: 'get' }
        this.requestType = this.applyApiPrefixReqType(uniApiKey);

        // 是否有取代key語法
        // ex.[get]/api/MemberGroup/{id} ===> option: { innerKey: true }
        this.innerKey = this.applyApiInnerKey(uniApiKey);

        // 取得apiConfig的設定檔
        // this.config = this.fetchApiConfig(uniApiKey);
        this.apiConfig = new ApiConfig(uniApiKey);
        this.fakeApi = this.autoGetFakeApi(this.apiConfig);

        // 取得要傳送的data
        this.data = this.applyApiRequestData(data);

        // 取得要送給axios的api字串
        this.apiUrl = this.applyApiUrl(uniApiKey, option);


        this.token = LocalAccessor.getItem('token');

        // 組件header
        this.apiHeader = new ApiHeader(this.apiConfig);
        this.header = this.apiHeader.getHeader();

        // ps.這邊要改成抓 redux

        // -----------------------------------------------
        // console.log('apiOption', this)
        // [post]/msp0507/front - req:

        // // 印出Debug用的Log
        // if (process.env.REACT_APP_DEV_API_INFO === 'true') {
        //     // console.log(`${uniApiKey} req:`, this.data);
        //     console.log(`${uniApiKey} req:`, JSON.stringify(this.data));
        //     console.log(`${uniApiKey} header:`, this.header);
        // }
        this.printApiLog('req');
    }
    // [public] set Object
    // 儲存apiErrorHandler物件
    setApiErrorHandler(apiErrorHandler) {
        this.apiErrorHandler = apiErrorHandler;
    }

    setOutputFilter(outputFilter) {
        // console.log('instanceof res', (outputFilter instanceof OutputFilter));
        if (!(outputFilter instanceof OutputFilter)) {
            console.error('setOutputFilter fail: object OutputFilter validate fail');
            return;
        }
        this.outputFilter = outputFilter;
    }

    getOutputFilter() {
        return this.outputFilter;
    }

    // ------------------------------------------------------------------------------------
    // 自動取得FakeApi物件，若沒設定FakeApi，則會回null
    autoGetFakeApi(apiConfig) { // <ApiConfig>
        // console.log('autoGetFakeApi', ApiFake.checkFakeApi(apiConfig))

        if (ApiFake.checkFakeApi(apiConfig)) { // 將<ApiConfig>物件丟進去檢查是否為fakeApi
            return new ApiFake(apiConfig);
        }

        return null;
    }

    // -------------------------------------------------------------------------------


    // 檢查apiOption是否有成功創建
    validateConstructResult() {
        if (!this.apiConfig) {
            return Promise.reject('apiOption: apiConfig is not found');
        }
        if (!this.apiConfig.config) {
            return Promise.reject('apiOption.apiConfig: config is not found');
        }

        return Promise.resolve();
    }
    applyApiRequestData(data) {
        return data; // 目前沒有需要特製
    }
    filtApiPrefixReqType(uniApiKey) {
        // uniApiKey: '[put]/auth/activate/{token}'

        // 不需要，已統一使用uniApiKey
        // if (!getRegExp('restApiRegex').test(api)) {
        //     // 代表不是 [put]/api/Account 這種特殊格式的API，不用運算，直接回傳
        //     return api;
        // }

        let api = uniApiKey;
        // 將特殊格式的部分去除
        api = api.replace(getRegExp('restApiRegex'), '');
        api = api.trim(); // 去除首尾空白字元

        return api;
    }
    getDefineArg(key) {
        // 暫時不支援
        return '';

        // 舊版的，無法使用: 舊版是呼叫對應的函式，直接從Vuex取得參數
        // const argDefineHandleMap = {
        //     // <defineArgKey>: <handleFuncKey>
        //     tokenHash: 'getDefineArgTokenHash', // sendApi: '[get]/msp0602/{fileId}/{$tokenHash}' --> tokenHash
        // };

        // const handleKey = argDefineHandleMap[key];

        // if (!this[handleKey]) {
        //     console.error(`getDefineArg handleKey: ${handleKey} notFound`);
        //     return "";
        // }

        // return this[handleKey]();
    }
    filtApiInnerKey(api, apiInnerData) {
        const vm = this;
        if (!getRegExp('innerKeyApiRegex').test(api)) {
            // 代表不是 /api/MemberGroup/{id} 這種特殊格式的API，不用運算，直接回傳
            return api;
        }
        if (!apiInnerData){
            console.error(`apiOption filtApiInnerKey: apiInnerData not exist`);
        }
        // 將特殊格式的部分置換參數進去
        // v1
        // Object.keys(apiInnerData).forEach((key) => {
        //     const repKey = `{${key}}`;
        //     api = api.replace(repKey, apiInnerData[key]);
        // });

        // innerKeyApiRegex: /\{[a-zA-Z0-9_\$]+\}/g
        api = api.replace(getRegExp('innerKeyApiRegex'), function (symbol) {
            // symbol: {file_id}
            // symbol: {$tokenHash}

            const isDefineArg = /^\{\$[a-zA-Z0-9_]+\}/.test(symbol);

            if (isDefineArg) {
                // '{$tokenHash}' ==> 'tokenHash'
                // 代表是要抓系統內宣告的參數
                const key = symbol.slice(2, symbol.length - 1);

                return `${vm.getDefineArg(key)}`;
            }
            // 一般的內置參數、去頭去尾:  {file_id} --> file_id
            const key = symbol.slice(1, symbol.length - 1);

            const data = apiInnerData[key];
            if (data === undefined) {
                // 沒有抓到內置參數，跳error
                console.error('apiInnerDataNotExist');
                return symbol;
            }

            return `${data}`;
        });

        api = api.trim(); // 去除首尾空白字元

        return api;
    }
    // 將apiKey轉成API
    applyApiUrl(uniApiKey, option) {
        // [get]/api/MemberGroup/{id} ===> /api/MemberGroup/{id}
        let api = this.filtApiPrefixReqType(uniApiKey);
        // /api/MemberGroup/{id} ===> /api/MemberGroup/M5i7ClDINPb
        api = this.filtApiInnerKey(api, option.apiInnerData);

        return api;
    }





    // getRegExp(key) {
    //     if (key === 'restApiRegex') {
    //         return new RegExp("^\\[\\w+\\]");
    //     } else if (key === 'innerKeyApiRegex') {
    //         // return new RegExp("\\{\\w+\\}", "g"); // v1
    //         return new RegExp("\\{[a-zA-Z0-9_\\$]+\\}", "g"); // origin: /\{[a-zA-Z0-9_\$]+\}/g
    //     }
    //     return null;
    // }
    getUniApiKey(apiKey) {
        // console.log(`getUniApiKey: ${apiKey}`, option);

        // 暫時不使用option直接設定uniApiKey
        // if (option.uniApiKey) {
        //     /* option: {
        //         equestType: "post"
        //         uniApiKey: "[post]/msp0111"
        //     } */
        //     // 代表前面已經有處理過了，直接回傳
        //     return option.uniApiKey;
        // }

        if (getRegExp('restApiRegex').test(apiKey)) {
            // 代表有[post]前綴，直接回傳
            return apiKey;
        }

        // 沒有前綴，預設使用post
        return `[post]${apiKey}`;

        // 舊版有自動去config內尋找設定
        // let reqType = this.getApiRequestType(apiKey, option);
        // const uniApiKey = `[${reqType}]${apiKey}`;
        // return uniApiKey;
    }
    applyApiPrefixReqType(uniApiKey) {
        // 一律使用uniApiKey作判斷，不需要再額外判斷restApiRegex
        // // const restApiRegex = /^\[\w+\]/g;
        // if (!this.getRegExp('restApiRegex').test(apiKey)) {
        //     // 代表不是 [put]/api/Account 這種特殊格式的API
        //     return;
        // }

        //取出符合的字串陣列
        const arr = uniApiKey.match(getRegExp('restApiRegex'));
        // arr: ["[put]"]
        if (arr.length === 0) {
            // 代表沒抓到參數
            return;
        }

        const apiModeStr = arr[0]; // apiModeStr: "[put]"
        const requestType = apiModeStr.slice(1, apiModeStr.length - 1) // 去除頭尾的[]

        return requestType.toLowerCase(); // 支援[PUT]大寫格式
    }
    applyApiInnerKey(uniApiKey) {
        return getRegExp('innerKeyApiRegex').test(uniApiKey);
    }


    // [public] ---------------------------------------------
    getRequestType() {
        return this.requestType;
    }
    getApiUrl() {
        // 可自動辨識apiConfig內設定的apiUrl
        return this.apiConfig.getApiConfigUrl() || this.apiUrl;
    }
    getApiData() {
        return this.data;
    }
    getHeader() {
        return this.header;

        // return {
        //     TokenHash: 'xxxxxxxxxxxxxxxxxxxx'
        // }
    }
    getOptionUniApiKey() {
        return this.uniApiKey;
    }
    // [public]
    getApiConfig() {
        return this.apiConfig;
    }

    setResData(resData) {
        this.resData = resData;
    }

    setOutData(outData) {
        this.outData = outData;
    }

    printApiLog(logType) {
        ApiLog.printApiLog(this, logType);

        // ApiLog.printApiLog.call(this, logType);
    }
    // printApiLog(logType) {

    //     // // 印出Debug用的Log
    //     // if (process.env.REACT_APP_DEV_API_INFO === 'true') {
    //     //     // console.log(`${uniApiKey} req:`, this.data);
    //     //     console.log(`${uniApiKey} req:`, JSON.stringify(this.data));
    //     //     console.log(`${uniApiKey} header:`, this.header);
    //     // }

    //     if (process.env.REACT_APP_DEV_API_INFO !== 'true') {
    //         return;
    //     }

    //     let printMode = 'default'; // 'json'

    //     const jsonPrintModeMap = {
    //         // '[get]/account-entities': true,
    //     };
    //     if (jsonPrintModeMap[this.uniApiKey]) {
    //         printMode = 'json';
    //     }

    //     let logTypeShow;
    //     let apiUrl = this.uniApiKey;
    //     let srcData;

    //     if (logType === 'req') {
    //         srcData = this.data;
    //         logTypeShow = 'req';
    //     } else if (logType === 'res') {
    //         srcData = this.resData;
    //         logTypeShow = 'response';
    //     } else if (logType === 'out') {
    //         srcData = this.outData;
    //         logTypeShow = 'out';
    //     }

    //     if (/\{\w+\}/.test(apiUrl)) { // '[put]/account-entities/{id}'
    //         apiUrl += ` >> ${this.getApiUrl()}`;
    //     }
    //     // if (this.requestType === 'get' || this.requestType === 'put') {
    //     //     apiUrl += ` >> ${this.getApiUrl()}`;
    //     // }

    //     if (printMode === 'json') {
    //         srcData = JSON.stringify(srcData);
    //     }

    //     console.log(`${apiUrl} ${logTypeShow}:`, srcData);

    //     return;
    // }

}