

export default class ApiErrorHandler {
    promise = null;
    resolve = null;
    reject = null;
    constructor() {
        const vm = this;

        this.promise = new Promise((resolve, reject) => {
            vm.resolve = resolve;
            vm.reject = reject;
        });
    }
    catchError(runApiFunc) {
        const vm = this;

        runApiFunc().then((data) => {
            // 代表成功，直接結束Promise，回傳
            vm.resolve(data);
        }).catch(vm.handleError.bind(this));

        return this.promise; // 結束apiErrorHandler的promise
    }
    handleError(error) {
        if (typeof error === 'string') {
            // 代表是apiSender底層傳上來的，直接印出來，就結束這回合
            console.error(error);
            return;
        }
        // 代表是axios的error
        if (!error.response) {
            console.error(`axios error: response field not exist`, error);
            return;
        }
        if (!error.response.data) {
            console.error(`axios error: response.data field not exist`, error);

            this.reject('Server is Not Online'); // 跳error
            // this.reject({ // 跳error
            //     msg: 'Server is Not Online',
            //     // data: 'aaaaaa'
            // });
            return;
        }

        // console.log('error cccc', error)

        console.error(`server error:`, error.response.data);
        console.error(error);

        // this.reject(error.response.code);

        this.reject(error.response.data);
        // this.reject({ // 跳error
        //     msg: error.response.data,
        //     // data: 'aaaaaa'
        // });
        return;
    }

}