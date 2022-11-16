import ApiErrorHandler from "./errorHandler";

export default class ApiHandler {
    apiSender = null;
    constructor(apiSender) {
        this.apiSender = apiSender;
    }

    // callApi: 負責控管整個流程
    callApi(apiOption) { // <ApiOption>
        const vm = this;

        // 掛載apiErrorHandler在apiOption上
        apiOption.setApiErrorHandler(new ApiErrorHandler());

        apiOption.printApiLog('header');

        // 用errorHandler包起，來處理錯誤
        return apiOption.apiErrorHandler.catchError(function () {
            if (apiOption.fakeApi) { // 代表需要套用假的API
                return vm.runFakeApi(apiOption);
            }

            return vm.runApiRequest(apiOption); // http request呼叫
        }).then((resData) => {

            // 將回傳的數值存起來，提供printApiLog印出來
            apiOption.setResData(resData);
            apiOption.printApiLog('res');

            return Promise.resolve(resData);
        });
    }

    runFakeApi(apiOption) {
        return apiOption.fakeApi.make();
    }

    runApiRequest(apiOption) {
        if (apiOption.requestType === 'post') {
            return this.post(apiOption);
        } else if (apiOption.requestType === 'put') {
            return this.put(apiOption);
        } else if (apiOption.requestType === 'get') {
            return this.get(apiOption);
        } else if (apiOption.requestType === 'delete') {
            return this.delete(apiOption);
            // console.error('requestType not support delete');
            // return Promise.reject('requestType not support delete');
        }

        console.error('requestType not support at runApiRequest');
        return Promise.reject('requestType not support at runApiRequest');
    }

    post(apiOption) {
        const apiUrl = apiOption.getApiUrl();
        const data = apiOption.getApiData();
        const header = apiOption.getHeader();
        const axios = this.apiSender.axios;

        // console.log(`post apiUrl: ${apiUrl}`);
        // let axiosConfig = {
        //     headers: headers,
        //     responseType, // 'blob'
        //   };

        let axiosConfig = {
            headers: header,
        };

        return axios.post(apiUrl, data, axiosConfig).then((resData) => {
            /* resData: {
                data: {
                    code: 200
                    data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImV4cCI6MTY1OTIzOTY5NywiaXNzIjoiY3Jvc3Nib3QifQ.CdwipbMhPxpxZAFX0JaF1n9l6npF3NCwAJumCJ6GCLE"
                    msg: "ok"
                }
            } */

            if (!resData.data) {
                return Promise.reject('response no data');
            }

            return Promise.resolve(resData.data);
        });
    }

    put(apiOption) {
        const apiUrl = apiOption.getApiUrl();
        const data = apiOption.getApiData();
        const headers = apiOption.getHeader();
        const axios = this.apiSender.axios;

        // return axiosProxy.put(apiUrl, data, {
        //     headers: headers
        //   });

        let axiosConfig = {
            headers: headers
        };

        return axios.put(apiUrl, data, axiosConfig).then((resData) => {
            /* resData: {
                data: {
                    code: 200
                    data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImV4cCI6MTY1OTIzOTY5NywiaXNzIjoiY3Jvc3Nib3QifQ.CdwipbMhPxpxZAFX0JaF1n9l6npF3NCwAJumCJ6GCLE"
                    msg: "ok"
                }
            } */

            if (!resData.data) {
                return Promise.reject('response no data');
            }

            return Promise.resolve(resData.data);
        });
    }

    get(apiOption) {
        const apiUrl = apiOption.getApiUrl();
        const data = apiOption.getApiData();
        const headers = apiOption.getHeader();
        const axios = this.apiSender.axios;

        let axiosConfig = {
            params: data,
            headers: headers,
            // responseType: null, // 'blob'
        };

        //   // 掛載progress模組
        //   axiosConfig = loadAxiosModule('progress', axiosConfig);
        //   return axiosProxy.get(apiUrl, axiosConfig);

        // console.log(`${apiUrl} get axiosConfig` , axiosConfig)

        return axios.get(apiUrl, axiosConfig).then((resData) => {
            /* resData: {
                data: {
                    code: 200
                    data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImV4cCI6MTY1OTIzOTY5NywiaXNzIjoiY3Jvc3Nib3QifQ.CdwipbMhPxpxZAFX0JaF1n9l6npF3NCwAJumCJ6GCLE"
                    msg: "ok"
                }
            } */

            if (!resData.data) {
                return Promise.reject('response no data');
            }

            return Promise.resolve(resData.data);
        });
    }
    delete(apiOption) {
        const apiUrl = apiOption.getApiUrl();
        const data = apiOption.getApiData();
        const headers = apiOption.getHeader();
        const axios = this.apiSender.axios;

        let axiosConfig = {
            params: data,
            headers: headers,
            // responseType: null, // 'blob'
        };

        return axios.delete(apiUrl, axiosConfig).then((resData) => {
            if (!resData.data) {
                return Promise.reject('response no data');
            }
            return Promise.resolve(resData.data);
        });
    }
}