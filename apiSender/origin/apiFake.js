import ApiConfig from "./apiConfig";

export default class ApiFake {

    fakeRes = null;

    // -----------------------------------------

    // 提供make()呼叫的函式
    makeFakeFunc = null;

    // 檢查是否為fakeApi
    static checkFakeApi(apiConfig) {
        // 目前只支援fakeRes
        const config = apiConfig.getConfig();
        return config.fakeRes != null;
    }

    constructor(apiConfig) {
        if (!(apiConfig instanceof ApiConfig)) {
            console.error(`ApiFake: apiConfig is not ApiConfig`);
            return;
        }

        const config = apiConfig.getConfig();

        // 目前只支援fakeRes
        if (config.fakeRes) {
            this.constructByFakeRes(config.fakeRes);
        }
    }
    // 使用 'fakeRes' 建構
    constructByFakeRes(fakeRes) {
        this.fakeRes = fakeRes;
        this.makeFakeFunc = this.makeFakeRes;
    }
    // [public] 生成假的API的response
    make() {
        if (!this.makeFakeFunc) {
            const error = `ApiFake: makeFakeFunc not exist`;
            console.error(error);
            return Promise.reject(error)
        }
        return this.makeFakeFunc.call(this);
    }

    makeFakeRes() {
        return Promise.resolve(this.fakeRes);
    }
}