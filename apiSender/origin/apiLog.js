

// 可控制當前要顯示的Log類型
const ApiLogShow = {
    apiUrl: true, // 可以顯示完全的apiUrl
    // header: true,
    req: true,
    res: true,
    out: false,
    printMode: null, // 'json', // null,
};

export default class ApiLog {

    static printApiLog(apiOption, logType) { // , printMode = 'default'
        // 這裡的this會指向apiOption

        let printMode = 'default';
        if (ApiLogShow.printMode === 'json') {
            printMode = 'json';
        }

        // console.log(`ApiLog.printApiLog`, logType);

        if (!ApiLogShow[logType]) {
            // 代表該Log目前不需顯示
            return;
        }

        if (process.env.REACT_APP_DEV_API_INFO !== 'true') {
            return;
        }

        // 舊版使用uniApiKey硬寫進去的方法
        // const jsonPrintModeMap = {
        //     // '[get]/account-entities': true,
        // };
        // if (jsonPrintModeMap[this.uniApiKey]) {
        //     printMode = 'json';
        // }

        let logTypeShow;
        let apiUrl = ApiLogShow.apiUrl ? `[${apiOption.getRequestType()}]${apiOption.getApiUrl()}` : apiOption.uniApiKey;
        let srcData;

        if (logType === 'req') {
            srcData = apiOption.data;
            logTypeShow = 'req';
        } else if (logType === 'res') {
            srcData = apiOption.resData;
            logTypeShow = 'response';
        } else if (logType === 'out') {
            srcData = apiOption.outData;
            logTypeShow = 'out';
        } else if (logType === 'header') {
            srcData = apiOption.header;
            logTypeShow = 'header';
        }

        if (/\{\w+\}/.test(apiUrl)) { // '[put]/account-entities/{id}'
            apiUrl += ` >> ${this.getApiUrl()}`;
        }

        if (printMode === 'json') {
            srcData = JSON.stringify(srcData);
        }

        // 輸出log
        console.log(`${apiUrl} ${logTypeShow}:`, srcData);

        return;
    }
}