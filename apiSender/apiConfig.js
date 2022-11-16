
import ApiFake from "./apiFake";
// import get_permissions from "./fakeRes/get_permissions"

const apiConfigMap = {
    '[post]/addTag': {

    },
    '[post]/removeTag': {},
    '[post]/addApi': {},
    '[post]/addBody': {},
    '[post]/editTag': {},
    '[post]/addResponse': {},
    '[post]/editAttr': {},
    '[post]/genSwagger': {},
    '[post]/listApiDoc': {
        outputType: 'apiCreator',
    },
    '[post]/doc/updateJson': {
        
    },
    '[post]/api/addQuery': {},
    '[put]/api/editQueryParam': {},
    // '[get]/permissions': {
    //     header: 'bearerTokenHeader',
    //     outputType: 'crossbot',
    //     // fakeRes: get_permissions,
    //     // apiUrl: 'http://localhost:8091/api/permissions', // [之後刪]mock-server，正式API完成後刪除
    // },
};

// const apiConfigExtendMap = {
//     '[put]/auth/activate/{token}': {
//         <=== 新增的欄位
//     },
// };

let apiConfigExtendMap = {};

Object.keys(apiConfigMap).forEach((uniApiKey) => {
    apiConfigExtendMap[uniApiKey] = apiConfigMap[uniApiKey];
});

export default class ApiConfig {
    uniApiKey = ''
    constructor(uniApiKey) {
        this.uniApiKey = uniApiKey;
        this.config = apiConfigExtendMap[uniApiKey];

        if (!this.config) {
            console.error(`${uniApiKey} apiConfig not found`);
        }
    }

    getConfig() {
        return this.config;
    }

    // 取得是否有額外設定的apiUrl
    getApiConfigUrl() {
        return this.config.apiUrl || null;
    }

    getOutputType() {
        return this.config.outputType;
    }
    // // 檢查是否為fakeApi
    // checkFakeApi() {
    //     return ApiFake.checkFakeApi(this);
    // }
}