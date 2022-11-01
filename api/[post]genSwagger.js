const fs = require('fs');
const path = require('path');

const gql = require('graphql-tag');

const { format: formatJSON } = require('json-string-formatter');

const SYSTEM_FRIEND_LIST = require('../graphQuery/schema/SYSTEM_FRIEND_LIST');

const GraphType = require('../graphQuery/graphType');

const GraphValidate = require('../graphQuery/graphValidate.js');
const GraphSchema = require('../graphQuery/graphSchema');
const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');

// 生成一個基本的swagger格式
const apiData = {
    apiType: 'post',
    reactType: 'json', // raw
    apiRoute: '/api/genSwagger', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        // const gSchema = new GraphSchema(GraphType.SYSTEM_FRIEND_LIST);
        // console.log('gSchema', gSchema);

        // const gSwagObj = new GraphSwagger(gSchema);
        // const swagJson = gSwagObj.convertSwaggerJson();

        const errList = checkRequired(req.body, ['title', 'host', 'fileName']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }
        // const swagMngObj = new SwaggerManage();

        // host: 'localhost:8020' <--沒有http
        const swagObj = SwaggerManage.createSwagger(req.body);

        // 生成json檔-------------------------------------

        const fileName = req.body.fileName;
        const jsonFilePath = SwaggerManage.getFilePath(fileName);

        const jsonContent = formatJSON(JSON.stringify(swagObj));

        fileHelper.checkPathExist(jsonFilePath).then((isFile) => {
            console.log('isFile', isFile)

            if (isFile) {
                return Promise.reject(`file ${jsonFilePath} has exist`);
                // return res.refuse(req, res, `file ${jsonFilePath} has exist`);
            }

            return fileHelper.writeFile(jsonFilePath, jsonContent);
        }).then(() => {

            res.react({
                code: "0", // 0代表成功
                data: swagObj,
                msg: "ok",
            });
        }).catch((err) => {
            res.refuse(`error`, err);
        })
    }
}
module.exports = apiData;