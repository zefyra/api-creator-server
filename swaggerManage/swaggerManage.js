const fs = require('fs');
const path = require('path');
const fileHelper = require('../utils/fileHelper');

const { format: formatJSON } = require('json-string-formatter');
const SchemaManage = require('../graphQuery/schemaManage');
const AttrSrc = require('../enum/apiConnect/AttrSrc');
const PathLoader = require('../utils/pathLoader');

let apiDocInfoList = null;
/* [{
    type   // (docType)
    fileName,
    path
}] */


class SwaggerManage {
    swagObj = null; // swagger json轉成的物件
    filePath = '';
    constructor(swagObj, filePath, docType) {
        this.swagObj = swagObj;

        this.filePath = filePath; // 用來存檔用的

        this.docType = docType;
    }

    getObj() {
        return this.swagObj;
    }

    getJson() {
        return formatJSON(JSON.stringify(this.swagObj));
    }

    removeTag(name) {
        if (!this.swagObj.tags) {
            return Promise.resolve(); // 代表沒有任何tags欄位
        }

        const index = this.swagObj.tags.findIndex(tag => tag.name === name);

        if (index < 0) {
            return Promise.resolve(); // 代表沒找到
        }
        this.swagObj.tags.splice(index, 1);

        return Promise.resolve();
    }

    addTag(name, description, groupName) {
        if (!this.swagObj.tags) {
            this.swagObj.tags = [];
        }

        // if( this.)

        this.swagObj.tags.push({
            "name": name,
            "description": description || '',
            // "externalDocs": {
            //     "description": "Find out more",
            //     "url": "http://swagger.io"
            // },
            "groupName": groupName,
        });

        return Promise.resolve();
    }
    editTag(tagName, summary) {
        if (!this.swagObj.tags) {
            return Promise.reject(`editTag: no any tag`); // 代表沒有任何tag
        }

        const tagIndex = this.swagObj.tags.findIndex(eachTag => (eachTag.name === tagName));
        if (tagIndex < 0) {
            return Promise.resolve(`editTag: tag not found`); // 代表沒有任何tag
        }
        this.swagObj.tags[tagIndex].groupName = summary;

        return Promise.resolve();
    }

    addApi(apiRoute, apiType, tags, summary) {
        if (tags.length === 0) {
            console.error(`swaggerManager addApi: tags length is 0`);
            return Promise.reject(`swaggerManager addApi: tags length is 0`);
        }

        apiType = apiType.toLowerCase();

        if (!this.swagObj.paths) { // 新增API的欄位
            this.swagObj.paths = {};
        }

        if (!this.swagObj.paths[apiRoute]) {
            // 代表該route不存在
            this.swagObj.paths[apiRoute] = {};
        }

        if (this.swagObj.paths[apiRoute][apiType]) {
            // 代表該API已存在
            return Promise.reject(`apiHasExist`);
        }

        if (this.docType === 'swagger2') {
            this.swagObj.paths[apiRoute][apiType] = {
                "produces": [
                    "application/json"
                ],
                "tags": tags,
                // "tags": [
                //     ""
                // ],
                "summary": summary, // API名稱
                "parameters": [], // 參數 (body或是path param)
                "responses": {}, // '200' 是成功、'500' 是 error
            }
        } else if (this.docType === 'openapi3') {
            this.swagObj.paths[apiRoute][apiType] = {
                "tags": tags,
                "summary": summary, // API名稱
                "parameters": [], // 參數 (body或是path param)
                "responses": {}, // '200' 是成功、'500' 是 error
            }
        } else {
            return Promise.reject('docType unknown');
        }

        return Promise.resolve();
    }

    async loadApiSecurity(apiRoute, apiType) {
        // console.log('this.swagObj', this.swagObj);

        if (!this.swagObj) {
            return Promise.reject('swagObj not exist');
        }
        if (!this.swagObj.paths) {
            return Promise.reject('swagObj.paths not exist');
        }
        if (!this.swagObj.paths[apiRoute]) {
            return Promise.reject(`swagObj.paths apiRoute not exist, ${apiRoute}`);
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            return Promise.reject(`swagObj.paths[<apiRoute>] apiType not exist, ${apiRoute}, ${apiType}`);
        }

        return this.swagObj.paths[apiRoute][apiType].security || [];
    }

    async setApiSecurity(apiRoute, apiType, securityKey) {
        if (!this.swagObj) {
            return Promise.reject('swagObj not exist');
        }
        if (!this.swagObj.paths) {
            return Promise.reject('swagObj.paths not exist');
        }
        if (!this.swagObj.paths[apiRoute]) {
            return Promise.reject(`swagObj.paths apiRoute not exist, ${apiRoute}`);
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            return Promise.reject(`swagObj.paths[<apiRoute>] apiType not exist, ${apiRoute}, ${apiType}`);
        }

        if (!this.swagObj.paths[apiRoute][apiType].security) {
            this.swagObj.paths[apiRoute][apiType].security = [];
        }
        this.swagObj.paths[apiRoute][apiType].security.push({
            [securityKey]: [],
        });
        /* 	"security": [{
            "Token": []
        }], */

        return;
    }

    listApi(tag) {
        if (!this.swagObj.paths) {
            return Promise.resolve([]);
        }

        let routeList = Object.keys(this.swagObj.paths);

        if (routeList.length === 0) {
            return Promise.resolve([]);
        }

        let apiList = [];
        routeList.forEach((route) => {
            // route: '/api/friend'

            Object.keys(this.swagObj.paths[route]).forEach((apiType) => {
                const apiSwagObj = this.swagObj.paths[route][apiType];

                apiList.push({
                    route: route,
                    apiType: apiType,
                    summary: apiSwagObj.summary,
                    tags: apiSwagObj.tags,
                });
            });
        });

        if (tag) {
            apiList = apiList.filter((apiObj) => {
                return apiObj.tags.includes(tag);
            });
        }

        return Promise.resolve(apiList);
    }

    removeApi(apiType, route) {
        // console.log(`listApi`, this.swagObj);
        if (!this.swagObj.paths[route]) {
            console.error(`removeApi: route not exist`);
            return Promise.reject(`removeApi: route not exist`);
        }
        if (!this.swagObj.paths[route][apiType]) {
            console.error(`removeApi: apiType not exist`);
            return Promise.reject(`removeApi: apiType not exist`);
        }

        delete this.swagObj.paths[route][apiType];

        if (Object.keys(this.swagObj.paths[route]).length === 0) {
            // 代表是空物件，裡面沒有其他apiType
            delete this.swagObj.paths[route];
        }

        return Promise.resolve(this.swagObj);
    }

    removeDefinition(rootType) {
        if (!this.swagObj.definitions) {
            return Promise.resolve();
        }
        delete this.swagObj.definitions[rootType];
        return Promise.resolve();
    }

    addDefinition(gSchema) {
        if (gSchema.constructor.name !== 'GraphSchema') {
            console.error(`gSchema is not GraphSchema`);
            return Promise.reject(`gSchema is not GraphSchema`);
        }

        if (!this.swagObj.definitions) {
            this.swagObj.definitions = {};
        }

        // this.swagObj.definitions["service.AccountEntityEnabled"] = {
        //     "type": "object",
        //     "properties": {
        //         "enabled": {
        //             "type": "boolean"
        //         }
        //     }
        // };
        let swagSchemaObj;
        try {
            swagSchemaObj = this.convertGraphSchemaToSwagger(gSchema);
        } catch (err) {
            return Promise.reject(err);
        }

        this.swagObj.definitions[gSchema.rootType] = swagSchemaObj;

        return Promise.resolve();
    }

    // 組建swaggerSchema
    convertGraphSchemaToSwagger(gSchema) {
        if (gSchema.constructor.name !== 'GraphSchema') {
            console.error(`convertGraphSchemaToSwagger: gSchema is not GraphSchema`);
            return;
        }

        if (gSchema.isRef) {
            // 使用參照
            return SchemaManage.getSwaggerRefDefinition(gSchema);
        }

        // 建構 --------------------------------------------------

        // 建構所有typeDef的swaggerObj
        const err = gSchema.buildSwagObjMap();
        if (err) {
            console.error(`buildSwagObjMap: build fail`);
            throw err;
        }

        const rootSwagObj = gSchema.getRootSwagObj();

        if (!rootSwagObj) {
            console.error(`rootSwagObj not found`);
            return;
        }

        console.log(`rootSwagObj`, rootSwagObj);
        return rootSwagObj;

        /*
        // 建構rootTypeDef

        const swagSchemaObj = {
            "type": "object",
            "properties": {}
        }

        const requiredKeyList = [];
        gSchema.rootTypeDef.fieldList.forEach((graphFieldObj) => {

            if (graphFieldObj.isNonNull) { // 代表是必填欄位
                requiredKeyList.push(graphFieldObj.fieldName);
            }

            const swagFieldObj = graphFieldObj.genSwaggerObj();
            swagSchemaObj.properties[graphFieldObj.fieldName] = swagFieldObj;
        });

        swagSchemaObj['required'] = requiredKeyList;

        return swagSchemaObj;
        */
    }

    addResponse(apiType, apiRoute, resType, gSchema, description) {
        // resType: '200'
        if (!description) {
            description = '';
        }

        // 檢查API是否存在
        if (!this.swagObj.paths[apiRoute]) {
            return Promise.reject(`apiRoute not exist`);
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            return Promise.reject(`apiRoute apiType not exist`);
        }

        const apiObj = this.swagObj.paths[apiRoute][apiType];
        if (!apiObj.responses) {
            apiObj.responses = {};
        }

        let swagSchemaObj;
        try {
            swagSchemaObj = this.convertGraphSchemaToSwagger(gSchema);
        } catch (err) {
            return Promise.reject(err);
        }


        if (this.docType === 'swagger2') {
            apiObj.responses[resType] = {
                "description": description, // "OK"
                "schema": swagSchemaObj,
            }
        } else if (this.docType === 'openapi3') {
            apiObj.responses[resType] = {
                "description": description, // "OK"
                "content": {
                    "application/json": {
                        "schema": swagSchemaObj,
                    }
                }
            }
        } else {
            return Promise.reject('docType unknown');
        }

        // apiObj.responses[resType] = {
        //     "description": description, // "OK"
        //     "schema": swagSchemaObj,
        // }
        return Promise.resolve(this.swagObj);
    }

    addBody(apiType, apiRoute, gSchema) {

        // 檢查API是否存在
        if (!this.swagObj.paths[apiRoute]) {
            return Promise.reject(`apiRoute not exist`);
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            return Promise.reject(`apiRoute apiType not exist`);
        }

        const apiObj = this.swagObj.paths[apiRoute][apiType];

        if (!apiObj.parameters) {
            apiObj.parameters = [];
        }

        const bodyParameterIndex = apiObj.parameters.findIndex((eachParameterObj) => {
            return eachParameterObj.in === 'body';
        });
        // if (bodyParameter) {
        //     return Promise.reject('bodyParameter has exist');
        // }
        if (bodyParameterIndex >= 0) {
            // 代表舊的body已存在，把舊的先刪掉
            apiObj.parameters.splice(bodyParameterIndex, 1);
        }

        // apiObj.parameters.push({
        //     "description": "Payload",
        //     "name": "Body",
        //     "in": "body",
        //     "required": true,
        //     "schema": {
        //         "$ref": "#/definitions/service.AccountEntityEnabled"
        //     }
        // });

        let swagSchemaObj;
        try {
            swagSchemaObj = this.convertGraphSchemaToSwagger(gSchema);
        } catch (err) {
            return Promise.reject(err);
        }


        if (this.docType === 'swagger2') {
            apiObj.parameters.push({
                "description": "Payload",
                "name": "Body",
                "in": "body",
                "required": true,
                "schema": swagSchemaObj,
            });
        } else if (this.docType === 'openapi3') {
            apiObj.requestBody = {
                content: {
                    "application/json": {
                        "schema": swagSchemaObj,
                    }
                }
            }
        } else {
            return Promise.reject('docType unknown');
        }

        return Promise.resolve(this.swagObj);
    }

    addQuery(apiType, apiRoute, type, name, inVal, defaultVal, description, enumVal) {

        // 檢查API是否存在
        if (!this.swagObj.paths[apiRoute]) {
            return Promise.reject(`apiRoute not exist`);
        }
        if (!this.swagObj.paths[apiRoute][apiType]) {
            return Promise.reject(`apiRoute apiType not exist`);
        }

        const apiObj = this.swagObj.paths[apiRoute][apiType];

        if (!apiObj.parameters) {
            apiObj.parameters = [];
        }

        if (!type || !name || !inVal) {
            return Promise.reject(`addQuery: arg leak`);
        }

        const queryParameter = {
            type: type,
            name: name,
            in: inVal,
        };

        if (defaultVal != null) queryParameter['default'] = defaultVal;
        if (description != null) queryParameter['description'] = description;
        if (enumVal != null) queryParameter['enum'] = enumVal;

        apiObj.parameters.push(queryParameter);

        return Promise.resolve(this.swagObj);
    }

    save(filePath, json) {
        const vm = this;
        if (!filePath) {
            filePath = this.filePath;
        }
        if (!filePath) {
            console.error(`swaggerManage: filePath not exist`);
            return Promise.reject(`swaggerManage: filePath not exist`);
        }

        // const jsonContent = this.getJson();
        let jsonContent;
        if (json) {
            jsonContent = json;
        } else {
            jsonContent = this.getJson();
        }

        // 將檔案存回去
        return fileHelper.writeFile(filePath, jsonContent).then(() => {
            return Promise.resolve(vm.swagObj);
        });
    }



    static getApiDocType(swagObj) {
        if (swagObj.swagger) {
            if (swagObj.swagger === '2.0') {
                return 'swagger2';
            }
        } else if (swagObj.openapi) {
            if (swagObj.openapi === '3.0.0') {
                return 'openapi3';
            }
        }

        return null;
    }


    static async initApiDocInfoList() {
        const folderPath = SwaggerManage.getFilePath();

        const loader = new PathLoader(folderPath, (fileName) => /\.json$/.test(fileName))
        /* newApiDocList: [{fileName: 'api-creator.json',
        path: 'c:\\ServerProject\\api-creator-server\\public\\apiDoc/api-creator.json'}] */

        let isErr = false;
        const errHandle = (err) => {
            isErr = true;
            console.error(err)
        };

        await loader.load();
        apiDocInfoList = await loader.mapAsync(async (docInfo) => {

            // type: 讀取、辨別檔案版本
            const swagObj = await fileHelper.readJsonFile(docInfo.path).catch(errHandle);
            if (isErr) return;
            const docType = SwaggerManage.getApiDocType(swagObj)
            if (!docType) {
                errHandle(`initApiDocInfoList: docType not found`, docInfo.fileName);
                return docInfo;
            }
            docInfo.type = docType;

            // path
            docInfo.path = `http://localhost:5050/apiDoc/${docInfo.fileName}`;

            // fileName: 去除副檔名
            const rawFileName = docInfo.fileName.replace(/\.[^/.]+$/, "");
            docInfo.fileName = rawFileName;

            console.log(`json file has on '${docInfo.path}' - [${docInfo.fileName}] <${docType}>`);

            return docInfo;
            // console.log('swagObj', swagObj);
        }).catch(errHandle);
        if (isErr) return;
    }

    static async getApiDocList() {

        const waitTime = function (period) {
            return new Promise((resolve, reject) => {
                setTimeout(function () {
                    resolve();
                }, period);
            });
        }

        let isTimeout = false;
        setTimeout(function () {
            isTimeout = true;
        }, 30 * 1000)
        const checkIsTimeout = function () {
            return isTimeout;
        };

        while (apiDocInfoList == null) {
            console.log('waitTime');
            await waitTime(3000);
            if (checkIsTimeout()) {
                return Promise.reject(`getApiDocList is timeout`);
            }
        }

        return apiDocInfoList.map(val => val);

        // if (!apiDocInfoList) {

        //     return new Promise((resolve, reject) => {
        //         setTimeout(function () {
        //             if (!apiDocInfoList) {
        //                 return reject(`apiDocInfoList not exist`);
        //             }
        //             return resolve(apiDocInfoList.map(val => val));
        //         }, 5000);
        //     });
        // }

        // return Promise.resolve(apiDocInfoList.map(val => val));
    }

    static getFilePath(fileName) {
        if (!fileName) {
            // 只丟出資料夾路徑
            return path.join(__dirname, `../public/apiDoc`);
        }
        return path.join(__dirname, `../public/apiDoc/${fileName}.json`);
    }

    static getDocInfo(fileName) {
        if (!apiDocInfoList) {
            return null;
        }
        return apiDocInfoList.find((docInfo) => {
            return docInfo.fileName === fileName;
        });
    }

    static initByFileName(fileName) {
        // not required: 'description'
        // const fileName = req.body.fileName;
        // const filePath = path.join(__dirname, `../apiDoc/${fileName}.json`);
        const filePath = SwaggerManage.getFilePath(fileName);

        return fileHelper.readJsonFile(filePath).then((swaggerObj) => {

            const docInfo = SwaggerManage.getDocInfo(fileName);
            if (!docInfo) {
                return Promise.reject(`initByFileName: docInfo not found`);
            }
            const docType = docInfo.type;

            return new SwaggerManage(swaggerObj, filePath, docType);
        });
    }

    // 生成新swagger的基本字串
    static createSwagger(obj) {
        const title = obj.title;
        const description = obj.description;
        const version = obj.version;
        const host = obj.host;
        const docType = obj.docType;

        if (docType === 'openapi3') {
            let servers = [];

            const url = host; // 不另外開欄位，直接使用host
            if (url) {
                servers.push({
                    url: url,
                });
            }

            const openapiJson = {
                "openapi": "3.0.0",
                "servers": servers,
                // "servers": [
                //     {
                //         "url": "http://petstore.swagger.io/v2"
                //     }
                // ],
                "info": {
                    "description": description || "",
                    "version": version || "1.0.0",
                    "title": title,
                }
                // "info": {
                //     "description": ":dog: :cat: :rabbit: This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.",
                //     "version": "1.0.0",
                //     "title": "Swagger Petstore",
                //     "termsOfService": "http://swagger.io/terms/",
                //     "contact": {
                //         "email": "apiteam@swagger.io"
                //     },
                //     "license": {
                //         "name": "Apache 2.0",
                //         "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
                //     }
                // },
            };
            return openapiJson;
        }

        // swagger 2.0---------------------------------

        /* {
            "swagger": "2.0",
            "host": "localhost:8020",
            "info": {
                "description": "file description",
                "version": "1.0.0",
                "title": "Swagger File Name"
            },
        } */
        return {
            "swagger": "2.0",
            "host": host,
            "info": {
                "description": description || "",
                "version": version || "1.0.0",
                "title": title,
            },
        };
    }

    getEverySchemaHandle(mode) {
        let func;
        if (mode === 'removeAttributes') {
            func = this.removeEveryAttributes; // 用來刪除不小心加進去的attributes
        }

        if (func) {
            return func.bind(this);
        }
        console.error(`getEverySchemaHandle: func not exist`);
        return null;
    }


    runEveryRootSchema(apiObj, handle) {
        if (apiObj.parameters) {
            const bodyParameterObj = apiObj.parameters.find((eachParameterObj) => {
                return eachParameterObj.in === 'body';
            });
            if (bodyParameterObj) {
                if (bodyParameterObj.schema) {
                    handle(bodyParameterObj.schema);
                }
            }
        }
        if (apiObj.responses) {
            Object.keys(apiObj.responses).forEach((resStatus) => {
                const resObj = apiObj.responses[resStatus];
                if (resObj) {
                    if (resObj.schema) {
                        handle(resObj.schema);
                    }
                }
            });
        }
    }

    runEveryProp(schema, handle) {
        const vm = this;

        if (schema.type === 'object') {
            if (schema.properties) { // 物件: 跑每個prop
                Object.keys(schema.properties).forEach((propKey) => {
                    const propObj = schema.properties[propKey];
                    if (propObj) {
                        if (propObj.type === 'object') {
                            handle(propObj);
                            vm.runEveryProp(propObj, handle);
                        } else if (propObj.type === 'array') {
                            handle(propObj);
                            vm.runEveryProp(propObj, handle);
                        } else {
                            handle(propObj);
                        }
                    }
                });
            }
        } else if (schema.type === 'array') {
            const itemObj = schema.items;
            if (itemObj.type === 'object') { // 代表還有更底下的，繼續往下丟
                let propObj = itemObj;
                handle(propObj);
                vm.runEveryProp(propObj, handle);
            } else if (itemObj.type === 'array') {
                let propObj = itemObj;
                handle(propObj);
                vm.runEveryProp(propObj, handle);
            } else {
                handle(itemObj);
            }
        }
    }

    async removeEveryAttributes(apiObj) {
        const vm = this;

        const removeAttributesHandle = function (propObj) {
            if (!propObj) {
                return;
            }
            if (propObj.attributes) {
                delete propObj.attributes;
            }
        }

        return this.runEveryRootSchema(apiObj, function (schema) {
            if (!schema) {
                return;
            }
            removeAttributesHandle(schema);
            return vm.runEveryProp(schema, removeAttributesHandle);
        });
    }

    async everySchema(handle) {
        if (!this.swagObj.paths) {
            return;
        }
        let error;

        const pathList = Object.keys(this.swagObj.paths);
        for (let i = 0; i < pathList.length; i += 1) {
            const apiRoute = pathList[i];
            const pathObj = this.swagObj.paths[apiRoute];
            const apiTypeList = Object.keys(pathObj);
            for (let j = 0; j < apiTypeList.length; j += 1) {
                const apiType = apiTypeList[j];
                const apiObj = this.swagObj.paths[apiRoute][apiType];
                handle(apiObj, apiRoute, apiType);
            }
        }
    }


    editQueryParam(queryObj, attrData) {
        if (!this.swagObj.paths) {
            return Promise.reject(`editQueryParam: no paths`);
        }

        if (!this.swagObj.paths[queryObj.apiRoute]) {
            return Promise.reject(`editQueryParam: apiRoute not found`);
        }
        if (!this.swagObj.paths[queryObj.apiRoute][queryObj.apiType]) {
            return Promise.reject(`editQueryParam: apiType not found`);
        }
        const apiObj = this.swagObj.paths[queryObj.apiRoute][queryObj.apiType];

        // console.log('editQueryParam', apiObj)

        if (!apiObj.parameters) {
            return Promise.reject(`editQueryParam: parameters not found`);
        }

        const paramIndex = apiObj.parameters.findIndex((paramInfo) => {
            return paramInfo.in === 'query' && paramInfo.name === queryObj.attrName;
        });

        if (paramIndex < 0) {
            return Promise.reject(`editQueryParam: parameter info not found`);
        }
        const paramObj = apiObj.parameters[paramIndex];

        if (attrData.defaultValue !== null && attrData.defaultValue !== undefined) {
            paramObj.default = attrData.defaultValue;
        }
        if (attrData.valueType) {
            paramObj.type = attrData.valueType;
        }
        if (attrData.description) {
            paramObj.description = attrData.description;
        }

        if (attrData.required !== null) {
            // return Promise.reject(`editQueryParam: required attr not support`)
            // setRequired(attrData.required, upperObj, key);
        }

        if (attrData.attrName) {
            paramObj.name = attrData.attrName;
        }

        return Promise.resolve();
    }

    addSecurity({ securityKey, key, type, dataIn, description }) {
        const swagObj = this.swagObj;
        /* 在json內加入以下內容
            "components": {
                "securitySchemes": {
                    "Token": {
                        "type": "apiKey",
                        "name": "authorization",
                        "in": "header",
                        "description": "The authorization token for the API."
                    }
                }
            },
        */

        if (!swagObj.components) {
            swagObj.components = {};
        }
        if (!swagObj.components.securitySchemes) {
            swagObj.components.securitySchemes = {};
        }

        swagObj.components.securitySchemes[securityKey] = {
            "type": type, // "apiKey",
            "name": key, // "authorization",
            "in": dataIn, // "header",
            "description": description, // "The authorization token for the API."
        }

        return Promise.resolve();
    }


    editAttr(queryObj, attrData) {
        // const queryObj = {
        //     apiType: req.body.apiType,
        //     apiRoute: req.body.apiRoute,
        //     tags: req.body.tags,
        //     attrName: req.body.attrName,
        //     layerPath: req.body.layerPath,
        //     attrSrc: req.body.attrSrc,
        // };

        // attrData: {
        //     attrName: attrName,
        //     defaultValue: defaultValue,
        //     valueType: valueType,
        //     description: description,
        //     required: true,
        // },

        if (!this.swagObj.paths) {
            return Promise.reject(`editAttr: no paths`);
        }

        if (!this.swagObj.paths[queryObj.apiRoute]) {
            return Promise.reject(`editAttr: apiRoute not found`);
        }
        if (!this.swagObj.paths[queryObj.apiRoute][queryObj.apiType]) {
            return Promise.reject(`editAttr: apiType not found`);
        }
        const apiObj = this.swagObj.paths[queryObj.apiRoute][queryObj.apiType];

        const srcType = AttrSrc.parse(queryObj.attrSrc);

        let schema;
        if (srcType === AttrSrc.reqBody) {
            if (!apiObj.parameters) {
                return Promise.reject(`editAttr: no parameters`);
            }
            let bodyParameter;
            if (this.docType === 'swagger2') {
                bodyParameter = apiObj.parameters.find(paramObj => paramObj.in === 'body');
                if (!bodyParameter) {
                    return Promise.reject(`editAttr: bodyParameter not found`);
                }
                schema = bodyParameter.schema;
            } else if (this.docType === 'openapi3') {
                try {
                    schema = apiObj.requestBody.content["application/json"].schema;
                } catch (error) {
                    return Promise.reject(error);
                }
            } else {
                return Promise.reject('editAttr: docType unknown on get bodyParameter');
            }
            // const bodyParameter = apiObj.parameters.find(paramObj => paramObj.in === 'body');
            // schema = bodyParameter.schema;
        } else if (srcType === AttrSrc.resBody) {
            if (!apiObj.responses) {
                return Promise.reject(`editAttr: no responses`);
            }
            const statusCode = AttrSrc.parseStatusCode(queryObj.attrSrc);
            if (!statusCode) {
                return Promise.reject(`editAttr: statusCode not exist`);
            }
            if (!apiObj.responses[statusCode]) {
                return Promise.reject(`editAttr: responses statusCode ${statusCode} not found`);
            }
            if (this.docType === 'swagger2') {
                schema = apiObj.responses[statusCode].schema;
            } else if (this.docType === 'openapi3') {
                schema = apiObj.responses[statusCode].content["application/json"].schema;
            } else {
                return Promise.reject('editAttr: docType unknown');
            }
        }
        if (!schema) {
            return Promise.reject(`editAttr: schema not exist`);
        }

        // 找出該欄位
        const keyList = queryObj.layerPath.concat([queryObj.attrName])

        /* { // <obj>
            "type": "object",
            "properties": {
                "attrName": { // <propObj>
                    "type": "string",
                    "description": ""
                },
            }
        }*/


        const findAttr = function (obj, keyList, handle) {
            const firstKey = keyList[0];
            const nextKeyList = keyList.slice(1, keyList.length)

            if (obj.type === 'object') {
                if (!obj.properties) {
                    return `findAttr: no properties`;
                }
                const propObj = obj.properties[firstKey];
                if (!propObj) {
                    return `findAttr: properties ${firstKey} not exist`;
                }

                if (nextKeyList.length !== 0) { // 代表有下一層
                    return findAttr(propObj, nextKeyList, handle);
                }

                // 沒有下一層了，直接處理
                return handle(firstKey, propObj, obj.properties, obj, obj.type);
            } else if (obj.type === 'array') {
                if (!obj.items) {
                    return `findAttr: no items`;
                }
                // return `no support array`;

                // const propObj = obj.items;
                // if (!propObj) {
                //     return `findAttr: array item not exist`;
                // }
                const itemObj = obj.items;
                if (!itemObj) {
                    return `findAttr: array item not exist`;
                }
                if (nextKeyList.length !== 0) { // 代表有下一層
                    return findAttr(itemObj, nextKeyList, handle);
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



        const setRequired = function (requiredVal, upperObj, key) {
            if (!upperObj.required) {
                upperObj.required = [];
            }
            if (requiredVal) { // 代表改成，需要加入
                if (!upperObj.required.includes(key)) { // 尚未加入，才加入key
                    upperObj.required.push(key);
                }
            } else { // 需要移出
                const index = upperObj.required.indexOf(key);
                if (index >= 0) { // 已加入，才移出
                    upperObj.required.splice(index, 1);
                }
            }
        }

        const err = findAttr(schema, keyList, function (key, propObj, propMap, upperObj, upperType) {
            // console.log('findAttr', key, propObj)

            if (attrData.defaultValue !== null && attrData.defaultValue !== undefined) {
                propObj.default = attrData.defaultValue;
            }
            if (attrData.valueType) {
                propObj.type = attrData.valueType;
            }
            if (attrData.description) {
                propObj.description = attrData.description;
            }

            if (attrData.required !== null) {
                setRequired(attrData.required, upperObj, key);
            }

            if (attrData.attrName) {
                // if (!propMap || !key) { // 代表是array
                if (upperType === 'array') { // 代表是array
                    console.error(`array element cannot set attrName`);
                } else {
                    // 代表有要改名子，將原本的刪除，加入新的欄位
                    delete propMap[key];
                    propMap[attrData.attrName] = propObj;
                }
            }
        });
        if (err) {
            return Promise.reject(err);
        }

        return Promise.resolve();
    }
}

SwaggerManage.initApiDocInfoList();

module.exports = SwaggerManage;