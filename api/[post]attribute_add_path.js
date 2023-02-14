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
const PrehandleBuilder = require('../utils/PrehandleBuilder');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    // apiRoute: '/api/api/addQuery',
    apiRoute: '/api/attribute/add/path', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        // queryObj----------------------------------
        fileName: true,
        apiType: true,
        apiRoute: true,
        // ----------------------------------
        // type: true,
        name: true,
        in: true,
        default: true,
        description: true,
        // enum: true,
    }),
    handle: async function (req, res) {
        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        };
        /* req.body = {
            fileName: "qore-console"
            apiRoute: "/qore/account/{id}"
            apiType: "get"

            default: "1"
            description: "test_de"
            enum: undefined
            in: "path"
            name: "test"
            type: "string"
        } */

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        const queryObj = {
            apiRoute: req.body.apiRoute,
            apiType: req.body.apiType
        };

        const paramObj = {
            name: req.body.name,
            default: req.body.default,
            description: req.body.description,
            // enum: undefined
            // type: "string"
        };

        await swagMgObj.addParamInPath(queryObj, paramObj).catch(errHandle);
        if (isErr) return;

        swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;