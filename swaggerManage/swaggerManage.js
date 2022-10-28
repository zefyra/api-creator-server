const fs = require('fs');
const path = require('path');
const fileHelper = require('../utils/fileHelper');

const { format: formatJSON } = require('json-string-formatter');

module.exports = class SwaggerManage {
    swagObj = null;
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

    addTag(name, description, groupName) {
        if (!this.swagObj.tag) {
            this.swagObj.tag = [];
        }

        this.swagObj.tag.push({
            "name": name,
            "description": description || '',
            // "externalDocs": {
            //     "description": "Find out more",
            //     "url": "http://swagger.io"
            // },
            "groupName": groupName,
        });
    }

    addApi(apiRoute, apiType, tags, summary) {
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

    addBody(gSchema) {
        // 未完成
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

    static initByFileName(fileName) {
        // not required: 'description'
        // const fileName = req.body.fileName;
        const filePath = path.join(__dirname, `../swagger/${fileName}.json`);

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
}