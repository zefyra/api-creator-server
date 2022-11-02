const fs = require('fs');
const path = require('path');

const GraphType = require('../graphQuery/graphType');

// const GraphValidate = require('../graphQuery/graphValidate.js');
const GraphSchema = require('../graphQuery/graphSchema');
const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const SchemaManage = require('../graphQuery/schemaManage')

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/addBody', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['fileName', 'apiRoute', 'apiType', 'rootType']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }
        // optional: 'schema'

        if (!req.body.rootType && !req.body.schema) {
            return res.refuse('fail', `\`rootType\` or \`schema\`, must have one`);
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        // 建構schema物件-----------------------------------------------------

        let schema = req.body.schema;
        let gSchema;
        if (!schema) { // 代表沒有直接輸入schema，要去gql庫裡抓
            gSchema = new GraphSchema(req.body.rootType);
        } else {
            gSchema = new GraphSchema(req.body.rootType, schema);
        }

        // 加入body-----------------------------------------------------
        let swagObj;
        swagObj = await swagMgObj.addBody(req.body.apiType, req.body.apiRoute,
            gSchema).catch(errHandle);
        if (isErr) return;

        swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;