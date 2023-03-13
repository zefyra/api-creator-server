const AttrSrc = require("../enum/apiConnect/AttrSrc");
const FieldFetcher = require("./FieldFetcher");

class ApiFetcher {

    apiObj = null;
    docType = null;
    constructor(apiObj, docType) {
        this.apiObj = apiObj;
        this.docType = docType;
    }

    getSchema(srcType, statusCode) {
        // srcType: <AttrSrc> enum
        const apiObj = this.apiObj;

        let schema;
        if (srcType === AttrSrc.reqBody) {
            if (!apiObj.parameters) {
                // return Promise.reject(`editAttr: no parameters`);
                throw `no parameters`;
            }
            let bodyParameter;
            if (this.docType === 'swagger2') {
                bodyParameter = apiObj.parameters.find(paramObj => paramObj.in === 'body');
                if (!bodyParameter) {
                    // return Promise.reject(`editAttr: bodyParameter not found`);
                    throw `bodyParameter not found`;
                }
                schema = bodyParameter.schema;
            } else if (this.docType === 'openapi3') {
                try {
                    schema = apiObj.requestBody.content["application/json"].schema;
                } catch (error) {
                    throw error
                }
            } else {
                throw `docType unknown on get bodyParameter`;
                // return Promise.reject('editAttr: docType unknown on get bodyParameter');
            }
            // const bodyParameter = apiObj.parameters.find(paramObj => paramObj.in === 'body');
            // schema = bodyParameter.schema;
        } else if (srcType === AttrSrc.resBody) {
            if (!apiObj.responses) {
                // return Promise.reject(`editAttr: no responses`);
                throw `no responses`;
            }
            // const statusCode = AttrSrc.parseStatusCode(attrSrc);
            if (!statusCode) {
                // return Promise.reject(`editAttr: statusCode not exist`);
                throw `statusCode not exist`;
            }
            if (!apiObj.responses[statusCode]) {
                // return Promise.reject(`editAttr: responses statusCode ${statusCode} not found`);
                throw `responses statusCode ${statusCode} not found`;
            }
            if (this.docType === 'swagger2') {
                schema = apiObj.responses[statusCode].schema;
            } else if (this.docType === 'openapi3') {
                schema = apiObj.responses[statusCode].content["application/json"].schema;
            } else {
                // return Promise.reject('editAttr: docType unknown');
                throw `docType unknown`;
            }
        } else {
            throw `unknown srcType`
        }
        if (!schema) {
            // return Promise.reject(`editAttr: schema not exist`);
            throw `schema not exist`;
        }

        return schema;
    }


    findAttr(obj, keyList, handle) {
        // if (keyList.length === 0) {
        //     return handle(firstKey, propObj, obj.properties, obj, obj.type);
        //     // return obj;
        // }

        const firstKey = keyList[0];
        const nextKeyList = keyList.slice(1, keyList.length)

        if (obj.type === 'object') {
            if (!obj.properties) {
                throw `findAttr: no properties`;
            }
            if (keyList.length === 0) { // 代表第一層即是底，直接將obj當成propObj丟下取
                return handle(null, obj, null, null, null);
                // function (key, propObj, propMap, upperObj, upperType) {
            }

            const propObj = obj.properties[firstKey];
            if (!propObj) {
                throw `findAttr: properties ${firstKey} not exist`;
            }

            if (nextKeyList.length !== 0) { // 代表有下一層
                return this.findAttr(propObj, nextKeyList, handle);
            }

            // 沒有下一層了，直接處理
            return handle(firstKey, propObj, obj.properties, obj, obj.type);
        } else if (obj.type === 'array') {
            if (!obj.items) {
                throw `findAttr: no items`;
            }
            // return `no support array`;

            // const propObj = obj.items;
            // if (!propObj) {
            //     return `findAttr: array item not exist`;
            // }
            const itemObj = obj.items;
            if (!itemObj) {
                throw `findAttr: array item not exist`;
            }
            if (nextKeyList.length !== 0) { // 代表有下一層
                return this.findAttr(itemObj, nextKeyList, handle);
            }
            // 沒有下一層了，直接處理
            // console.log('array handle', firstKey, obj)

            if (itemObj.type === 'object') {

                const propMap = itemObj.properties || {};
                const propObj = propMap[firstKey];

                return handle(firstKey, propObj, propMap, itemObj, obj.type); // 代表是array當中的物件(最後一層)
            }

            return handle(firstKey, propObj, propObj, obj.type); // 代表是array當中的物件(最後一層)
        }
    }

    getAttribute(schema, layerPathFull) {
        // layerPathFull: ['aaa', 'bbb', 'ccc']
        // ===> 最後會取出 'ccc' 欄位的物件回去
        const keyList = layerPathFull;

        let attrObj;
        this.findAttr(schema, keyList, function (key, propObj, propMap, upperObj, upperType) {
            // console.log('findAttr', key, propObj, propMap, upperObj, upperType);
            attrObj = propObj;
        });

        return attrObj;
    }
    getAttributeInFetch(attrSrc, layerPath) {
        const srcType = AttrSrc.parse(attrSrc);
        const statusCode = AttrSrc.parseStatusCode(attrSrc);
        const schema = this.getSchema(srcType, statusCode);
        const fieldObj = this.getAttribute(schema, layerPath);
        const fieldFetchObj = new FieldFetcher(fieldObj);

        return fieldFetchObj;
    }
}

module.exports = ApiFetcher;