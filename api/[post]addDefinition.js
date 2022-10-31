const fs = require('fs');
const path = require('path');

const GraphType = require('../graphQuery/graphType');

// const GraphValidate = require('../graphQuery/graphValidate.js');
const GraphSchema = require('../graphQuery/graphSchema');
const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');
const SchemaManage = require('../graphQuery/schemaManage');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/addDefinition', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['rootType', 'fileName']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        // 建構schema物件-----------------------------------------------------
        // const graphTypeKey = req.body.graphTypeKey;
        // const keyValid = GraphType.checkValidKey(graphTypeKey);
        // if (!keyValid) {
        //     res.refuse(`graphTypeKey is invalid`);
        //     return;
        // }

        const schema = SchemaManage.getSchema(req.body.rootType);
        if (!schema) {
            res.refuse(`schema not found`);
            return;
        }

        const gSchema = new GraphSchema(req.body.rootType, schema);


        await swagMgObj.addDefinition(gSchema).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;