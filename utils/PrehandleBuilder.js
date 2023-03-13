const ErrorHandle = require("./errorHandle");

class PrehandleUnit {
    run() {
        console.error(`PrehandleUnit: \`${this.constructor.name}\` must have run()`);
    }
}

class RequiredChecker extends PrehandleUnit {
    requiredKeyList = [];

    constructor(requiredKeyList) {
        super();
        this.requiredKeyList = requiredKeyList;
    }

    checkRequired(bodyObj, requiredKeyList) {
        let errorList = [];
        requiredKeyList.forEach((key) => {
            if (bodyObj[key] == null) {
                errorList.push(`key '${key}' is required!`);
            }
        });
        return errorList;
    }

    async run(req, res) {
        // const errList = checkRequired(req.body,
        //     ['fileName', 'apiRoute', 'apiType', 'rootType', 'resType']);
        const errList = this.checkRequired(req.body, this.requiredKeyList);
        if (errList.length !== 0) {
            // res.refuse("fail", errList); // 直接處理refuse
            return Promise.reject(errList);
        }

        return;
    }
}

class PrehandleBuilder {
    prehandleObjList = [];
    checkRequired(requiredJsonMap) {
        this.prehandleObjList.push(new RequiredChecker(Object.keys(requiredJsonMap)));
        return this;
    }

    async run(req, res) {
        for (let i = 0; i < this.prehandleObjList.length; i += 1) {
            const prehandleObj = this.prehandleObjList[i];
            if (!(prehandleObj instanceof PrehandleUnit)) {
                console.error(`PrehandleBuilder run: prehandleObj is not PrehandleUnit`);
                return;
            }

            const eh = new ErrorHandle();
            await prehandleObj.run(req, res).catch(eh.catchor());
            if (eh.isErr) return Promise.reject(eh.error);
        }

    }
}

module.exports = PrehandleBuilder;