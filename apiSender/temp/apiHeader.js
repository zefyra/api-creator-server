import LocalAccessor from "localAccessor";
import store from 'store'

export default class ApiHeader {
    header = null;
    constructor(apiConfig) {
        // 建立
        if (apiConfig) {
            this.header = this.buildHeader(apiConfig);

            // console.log('ApiHeader', this.header);
        }
    }

    buildHeader(apiConfig) {
        let apiConfigData = apiConfig.getConfig();
        // console.log('apiConfigData', apiConfigData);

        let buildHeaderFunc;
        if (apiConfigData.header) {
            buildHeaderFunc = this[apiConfigData.header];
            if (typeof buildHeaderFunc === 'function') {
                return buildHeaderFunc();
            }
        }

        return null;
    }

    bearerTokenHeader() {
        // 直接取得token
        const token = store.getState().login.token;
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    getHeader() {
        return this.header;
    }




    // buildHeader() {
    //     console.log('aaaaa')

    //     if (!this.apiConfig) {
    //         return null;
    //     }
    //     const apiConfigData = this.apiConfig.getConfig();
    //     if (!apiConfigData) {
    //         return null;
    //     }

    //     if (apiConfigData.header)

    //         return {
    //             Authorization: `Bearer ${this.token} apiConfigData`,
    //         };
    // }
}