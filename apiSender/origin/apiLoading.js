

const LOADING_WAIT_BUFFER = 300; // 0.3秒內沒收到API response，則開始轉圈圈


export class LoadingInterface { // Loading class物件需要實作的函式
    start() { }
    end() { }
}

// export class LoadingBuilder {
//     static buildLoadingWaitByState
// }

export class LoadingWait extends LoadingInterface {
    startFunc = null;
    endFunc = null;

    hasStart = false; // 代表是否已呼叫startFunc
    hasEnd = false; // 代表是否已完成載入
    constructor(start, end) {
        super();
        // console.log('LoadingWait construct');
        if (typeof start !== 'function') {
            console.error(`LoadingWait: start is not function`);
            return;
        }
        if (typeof end !== 'function') {
            console.error(`LoadingWait: end is not function`);
            return;
        }
        this.startFunc = start;
        this.endFunc = end;
    }
    start() {
        const vm = this;
        if (!this.startFunc) {
            console.error(`LoadingWait: startFunc not exist`);
            return;
        }

        setTimeout(function () {
            // console.log('LoadingWait start', this);
            if (vm.hasEnd) {
                return; // 代表已結束API呼叫，沒事
            }
            // 代表API載入還沒結束，開始執行轉圈圈
            vm.hasStart = true;
            vm.startFunc();
        }, LOADING_WAIT_BUFFER);
    }
    end() {
        // console.log('LoadingWait end', this);
        if (!this.endFunc) {
            console.error(`LoadingWait: endFunc not exist`);
            return;
        }
        this.hasEnd = true; // 標記: API載入結束
        if (!this.hasStart) {
            // hasStart = false 代表還沒呼叫startFunc()
            // 代表已收到 API response，略過，不必執行
            // console.error(`LoadingWait: startFunc() has not be call`);

            return;
        }
        this.endFunc();
    }
}

export default class ApiLoading {
    loadingObj = null;
    constructor(apiKey, data, option) {
        let loadingConfig = option.loading;
        /* loadingConfig: {
            start() {
                stateModel.setState('userTableLoading', true);
            },
            end() {
                stateModel.setState('userTableLoading', false);
            }
        } */
        if (!loadingConfig) { // 代表沒有要使用loading
            return;
        }

        // loadingObj建構(多形)
        if (loadingConfig.start && loadingConfig.end) {
            this.loadingObj = new LoadingWait(loadingConfig.start, loadingConfig.end);
        } else {
            console.error(`ApiLoading: option.loading format not support`);
        }
    }
    start() {
        if (!this.loadingObj) { // 代表沒有要使用loading
            return;
        }
        this.loadingObj.start();
    }
    end() {
        if (!this.loadingObj) { // 代表沒有要使用loading
            return;
        }
        this.loadingObj.end();
    }
}