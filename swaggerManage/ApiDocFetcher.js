const ApiFetcher = require("./ApiFetcher");

class ApiDocFetcher {
    swagObj = null;
    constructor(swagObj, docType) {
        this.swagObj = swagObj;
        this.docType = docType;
    }
    getApi(apiRoute, apiType) {
        if (!this.swagObj.paths) {
            throw `swagObj no paths`;
        }
        if (!this.swagObj.paths[apiRoute]) {
            throw `apiRoute not found, ${apiRoute}`;
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            throw `apiType not found, ${apiType}`;
        }
        return this.swagObj.paths[apiRoute][apiType]; // return apiObj;
    }
    getApiInFetch(apiRoute, apiType) {
        const apiObj = this.getApi(apiRoute, apiType);
        return new ApiFetcher(apiObj, this.docType);
    }
}


module.exports = ApiDocFetcher;