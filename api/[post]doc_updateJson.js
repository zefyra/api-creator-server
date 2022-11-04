// const fs = require('fs');
const path = require('path');

// const GraphType = require('../graphQuery/graphType');

// // const GraphValidate = require('../graphQuery/graphValidate.js');
// const GraphSchema = require('../graphQuery/graphSchema');
// const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/doc/updateJson', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body, ['fileName', 'json']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        const fileName = req.body.fileName;
        const json = req.body.json;

        const filePath = SwaggerManage.getFilePath(fileName);
        const swagMngObj = new SwaggerManage();
        await swagMngObj.save(filePath, json).catch(errHandle);
        if (isErr) return;

        res.react(true);
    }
}
module.exports = apiData;