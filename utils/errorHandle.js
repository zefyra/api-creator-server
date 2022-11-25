
class ErrorHandle {
    isErr = false;

    error = null;

    errEventCallback = null;

    constructor(errEventCallback) {
        // errEvent: catchor捕捉到error時，要執行的函式

        this.errEventCallback = errEventCallback;
    }


    // getErrHandle() {
    //     const vm = this;
    //     const errHandle = (err) => {
    //         vm.isErr = true;
    //         console.error(err)
    //     };

    //     return errHandle;
    // }


    catchor() {
        function errHandle(err) {
            this.isErr = true;
            this.error = err;
            console.error(err);

            if (this.errEventCallback) {
                this.errEventCallback(err);
            }
        };

        return errHandle.bind(this);
    }
}


module.exports = ErrorHandle