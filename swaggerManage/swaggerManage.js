const fs = require('fs');
const path = require('path');
const fileHelper = require('../utils/fileHelper');

const { format: formatJSON } = require('json-string-formatter');
const SchemaManage = require('../graphQuery/schemaManage');
const AttrSrc = require('../enum/apiConnect/AttrSrc');

module.exports = class SwaggerManage {
    swagObj = null; // swagger json轉成的物件
    filePath = '';
    constructor(swagObj, filePath) {
        this.swagObj = swagObj;

        this.filePath = filePath; // 用來存檔用的
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

        return Promise.resolve();
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

        apiObj.responses[resType] = {
            "description": description, // "OK"
            "schema": swagSchemaObj,
        }
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
        apiObj.parameters.push({
            "description": "Payload",
            "name": "Body",
            "in": "body",
            "required": true,
            "schema": swagSchemaObj,
        });

        return Promise.resolve(this.swagObj);
    }

    save(filePath) {
        const vm = this;
        if (!filePath) {
            filePath = this.filePath;
        }
        if (!filePath) {
            console.error(`swaggerManage: filePath not exist`);
            return Promise.reject(`swaggerManage: filePath not exist`);
        }

        const jsonContent = this.getJson();
        // 將檔案存回去
        return fileHelper.writeFile(filePath, jsonContent).then(() => {
            return Promise.resolve(vm.swagObj);
        });
    }

    static getFilePath(fileName) {
        if (!fileName) {
            // 只丟出資料夾路徑
            return path.join(__dirname, `../public/apiDoc`);
        }
        return path.join(__dirname, `../public/apiDoc/${fileName}.json`);
    }

    static initByFileName(fileName) {
        // not required: 'description'
        // const fileName = req.body.fileName;
        // const filePath = path.join(__dirname, `../apiDoc/${fileName}.json`);
        const filePath = SwaggerManage.getFilePath(fileName);

        return fileHelper.readJsonFile(filePath).then((swaggerObj) => {
            return new SwaggerManage(swaggerObj, filePath);
        });
    }

    // 生成新swagger的基本字串
    static createSwagger(obj) {
        const title = obj.title;
        const description = obj.description;
        const version = obj.version;
        const host = obj.host;

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
            const bodyParameter = apiObj.parameters.find(paramObj => paramObj.in === 'body');
            if (!bodyParameter) {
                return Promise.reject(`editAttr: bodyParameter not found`);
            }
            schema = bodyParameter.schema;
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
            schema = apiObj.responses[statusCode].schema;
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
                return handle(firstKey, propObj, obj.properties);
            } else if (obj.type === 'array') {
                if (!obj.items) {
                    return `findAttr: no items`;
                }

                return `no support array`;

                // obj.items




                // const propObj = obj.items[firstKey];
                // if (!propObj) {
                //     return `findAttr: array items ${firstKey} not exist`;
                // }

            }
        }

        const err = findAttr(schema, keyList, function (key, propObj, propMap) {
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

            if (attrData.attrName) {
                // 代表有要改名子，將原本的刪除，加入新的欄位
                delete propMap[key];
                propMap[attrData.attrName] = propObj;
            }
        });
        if (err) {
            return Promise.reject(err);
        }

        return Promise.resolve();
    }
}