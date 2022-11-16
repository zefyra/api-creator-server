// import React from 'react';
import _axios from "axios"
import ApiOption from "./apiOption"
import ApiHandler from "./apiHandler"
import { openAlertModal } from 'store/alert';
import ApiErrorClass from './apiError'
import OutputFilter from './outputFilter'
import ApiLoading from "./apiLoading";

var host = window.location.protocol + "//" + window.location.host;
// window.location.protocol ===> http
// window.location.host ===> localhost:3000
// console.log(`host: ${host}`);

// 預設使用當下Domain
let baseUrl = `${host}/api`;
if (process.env.REACT_APP_WEB_API_URL) {
    // 代表有指定API URL
    baseUrl = `${process.env.REACT_APP_WEB_API_URL}/api`;
}
// console.log(`baseUrl: ${baseUrl}`);

let axios = _axios.create({
    baseURL: baseUrl || 'http://localhost:8081',
    // baseURL: 'http://localhost:3003',
    timeout: 60000, // time設定: 60秒
});

// const axios = (baseURL) => {
//     //建立一個自定義的axios
//     const instance = _axios.create({
//         baseURL: baseURL || 'http://localhost:8081',
//         // baseURL: 'http://localhost:3003',
//         timeout: 1000,
//     });

//     return instance;
// };

// const axiosInstance = axios(baseUrl);

// class ApiSender extends React.Component {
class ApiSender {
    apiHandler = null;
    // axios = null;

    constructor(option) {
        /* option: {
            dispatch, selector
        } */


        // const apiSenderObj = new ApiSender({
        //     baseUrl: baseUrl, // 'http://localhost:8081'
        //     // baseUrl: `${process.env.REACT_APP_WEB_API_URL}/api`,
        // });

        // this.axios = _axios.create({
        //     baseURL: baseUrl || 'http://localhost:8081',
        //     // baseURL: 'http://localhost:3003',
        //     timeout: 60000, // time設定: 60秒
        // });

        this.axios = axios;

        this.apiHandler = new ApiHandler(this);
    }

    sendApi(apiKey, data, option = {}) {
        const apiHandler = this.apiHandler;

        return new Promise((resolve, reject) => {

            const apiLoading = new ApiLoading(apiKey, data, option);
            apiLoading.start();

            // 建構apiOption的參數
            const apiOption = new ApiOption(apiKey, data, option);

            // 生成一個OutputFilter
            const apiOutputFilter = new OutputFilter(data, apiOption);

            // 將outputFilter註冊進apiOption，方便後續提取
            apiOption.setOutputFilter(apiOutputFilter);

            // 檢查apiOption是否有成功創建
            apiOption.validateConstructResult().then(() => {

                return apiHandler.callApi(apiOption);
            }).then((data) => {
                // if (process.env.REACT_APP_DEV_API_INFO === 'true') {
                //     console.log(`${apiOption.getOptionUniApiKey()} response:`, data);
                //     // console.log(`${apiOption.getOptionUniApiKey()} response:`, JSON.stringify(data));
                //     // console.log(`${uniApiKey} header:`, this.data);
                // }

                apiLoading.end();

                resolve(apiOption.getOutputFilter().out(data));
            }).catch((error) => {
                reject(error);
            });

            // axios.post(apiKey, data).then((resData) => {
            //     console.log(`sendApiRes:`, resData);
            //     /* resData: {
            //         data: {
            //             code: 200
            //             data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImV4cCI6MTY1OTIzOTY5NywiaXNzIjoiY3Jvc3Nib3QifQ.CdwipbMhPxpxZAFX0JaF1n9l6npF3NCwAJumCJ6GCLE"
            //             msg: "ok"
            //         }
            //     } */
            //     if (!resData.data) {
            //         reject('response no data');
            //     }
            //     resolve(resData.data);
            // });
        });
    }
}


const apiSenderObj = new ApiSender();

export default apiSenderObj; // 匯出預設的ApiSender物件
