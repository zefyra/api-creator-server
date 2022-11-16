import { apiErrorOpenAlertModal, openErrorAlert } from 'store/alert';
import store from 'store'

export default class ApiError {
    // v2新版的
    constructor(errorFilter) {
        this.errorFilter = errorFilter;
    }

    catchAlertMsg() {
        // console.log('ccccc', openAlertModal());
        // console.log('aaaaaa', store.dispatch(openAlertModal({
        //     msg: 'aaaa',
        //     data: 'bbbb'
        // })));

        return this.handleCatchAlertMsg.bind(this);
    }

    handleCatchAlertMsg(error) {
        // console.error('catchAlertMsg error', error);
        // error: {data: null, code: '00001', msg: 'fail'}

        let doOpenAlertModal = true;

        let nextError;
        if (this.errorFilter) {
            doOpenAlertModal = false;
            this.errorFilter(error, function (error) { // next
                // error: 代表有要繼續把error往上拋
                doOpenAlertModal = true;
                nextError = error;
            });
        }

        if (!doOpenAlertModal) {
            // 代表不開啟燈箱
            return;
        }

        // if (typeof error === 'object') {
        //     store.dispatch(apiErrorOpenAlertModal());
        // } else {

        // }
        store.dispatch(apiErrorOpenAlertModal(error));

        if (nextError) {
            return Promise.reject(nextError);
        }
    }

    catchErrorMsg() {
        return this.handleCatchErrorMsg.bind(this);
    }

    handleCatchErrorMsg(error) {

        let nextError;
        if (this.errorFilter) {
            this.errorFilter(error, function (error) { // next
                nextError = error;
            });
        }

        if (nextError) {
            store.dispatch(apiErrorOpenAlertModal(nextError));
        }
    }

    runErrorAlert(error) {
        store.dispatch(openErrorAlert(error));
    }
}