
import ApiOption from "./apiOption";

export default class OutputFilter {
    reqData = null;
    resData = null;
    apiOption = null;
    constructor(reqData, apiOption) {
        this.reqData = reqData;
        this.setApiOption(apiOption);

        // console.log('OutputFilter', this);
    }
    // [public]
    setApiOption(apiOption) {
        if (!(apiOption instanceof ApiOption)) {
            console.error('setApiOption fail');
            return;
        }
        this.apiOption = apiOption;
    }
    setResData(resData) {
        this.resData = resData;
    }

    // ------------------------------------------------------------------------

    out(resData) {
        this.setResData(resData);
        const outType = this.apiOption.getApiConfig().getOutputType();
        let outData;
        if (this[outType]) {
            outData = this[outType]();
        } else {
            // 預設將整包resData直接輸出
            outData = this.resData;
        }
        this.apiOption.setOutData(outData);
        this.apiOption.printApiLog('out');
        return outData;
    }

    apiCreator() {
        if (!this.resData) {
            return null;
        }

        return this.resData.data;
    }

    // apiConfig內設定 outType: 'crossbot'，用來執行的函式
    // 基本的，單純只回傳data欄位
    crossbot() {
        if (!this.resData) {
            return null;
        }

        return this.resData.data;
    }

    crossbotRows() {
        if (!this.resData) {
            return null;
        }

        if (!this.resData.data.rows) {
            // 自動加上空陣列，避免跳錯
            this.resData.data.rows = [];
        }

        return this.resData.data;
    }

    crossbotTable() {
        if (!this.resData) {
            console.log(`OutputFilter: out fail at crossbotTable, resData not exist`);
            return null;
        }

        if (!this.resData.data) {
            console.log(`OutputFilter: out fail at crossbotTable, resData.data not exist`);
            return null;
        }
        /* this.resData.data: {
            count: 44,
            rows: [{
                account: {}
                entity: {}
            }],
            page: 1, // <=== 追加
            pageSize: 10,  // <=== 追加
        } */

        const outApiRes = {
            page: this.reqData.page, // 將req的頁數資料一起塞進去
            pageSize: this.reqData.pageSize,
        };

        outApiRes.count = this.resData.data.count;
        outApiRes.rows = this.resData.data.rows || [];
        return outApiRes;
    }
}