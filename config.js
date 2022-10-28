module.exports = {
    apiFolder: [{
        apiPrefix: '/api',
        path: './api',
        port: 8021, // 用來給getPrehandleList讀取的欄位
        // apiLog: true, // 要顯示log
    }, {
        apiPrefix: '/api',
        path: './apiQorePlus',
        port: 8022, // 用來給getPrehandleList讀取的欄位
        // apiLog: true, // 要顯示log
    }],
    // secret: 'JYGyyUbkb4i7TiKqyUMqbe77cZXeyslkYq4Va2nbs', // 目前沒用到
    // port: 8030, // acceptApi的port
    // notifyServers: { // 用來生成每個<Sender>: subscription收到資料時，要呼叫的URL
    //     "fake": {
    //         url: "http://localhost:8000", // Sender在用的參數
    //         pmMode: 'formData', // formData
    //         API_URL: "http://localhost:8000", // PostMan環境變數
    //     },
    //     "nats": {
    //         url: "http://localhost:8000",
    //         pmMode: 'formData', // formData
    //         API_URL: "http://localhost:8000", // PostMan環境變數
    //     },
    //     "mspTest": {
    //         // url: "http://msp-test.chtfintech.com.tw",
    //         url: "http://msp-dev.chtfintech.com.tw",
    //         pmMode: 'formData', // formData
    //         API_URL: "http://localhost:8000", // PostMan環境變數
    //     }
    // },
};