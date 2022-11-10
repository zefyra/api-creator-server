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
    apiRoute: '/api/api/addQuery', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['fileName', 'apiRoute', 'apiType',
                'type', 'name', 'in']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }
        // optional: 'default', 'description', 'enum'

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        // 加入query參數-----------------------------------------------------

        let swagObj = await swagMgObj.addQuery(
            req.body.apiType,
            req.body.apiRoute,
            req.body.type,
            req.body.name,
            req.body.in,
            req.body.default,
            req.body.description,
            req.body.enum
        ).catch(errHandle);
        if (isErr) return;

        swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;