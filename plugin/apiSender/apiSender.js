
import _axios from "axios"
// import ApiOption from "./apiOption"
// import ApiHandler from "./apiHandler"
// import { openAlertModal } from 'store/alert';
// import ApiErrorClass from './apiError'
// import OutputFilter from './outputFilter'
// import ApiLoading from "./apiLoading";


// const _axios = require("axios");
// const ApiOption = require("./apiOption");
// const ApiHandler = require("./apiHandler");

// var host = window.location.protocol + "//" + window.location.host;

// // 預設使用當下Domain
// let baseUrl = `${host}/api`;
// if (process.env.REACT_APP_WEB_API_URL) {
//     // 代表有指定API URL
//     baseUrl = `${process.env.REACT_APP_WEB_API_URL}/api`;
// }

// let axios = _axios.create({
//     baseURL: baseUrl || 'http://localhost:8081',
//     // baseURL: 'http://localhost:3003',
//     timeout: 60000, // time設定: 60秒
// });

class ApiSender {

}

// 寫到這裡: 還要把其他ApiSender的code搬過來


const apiSenderObj = new ApiSender();

export default apiSenderObj; // 匯出預設的ApiSender物件
