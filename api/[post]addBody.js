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

        // const graphTypeKey = req.body.graphTypeKey;
        // const fileName = req.body.fileName;
        // const target = req.body.target;

        // 讀取json檔-----------------------------------------------------
        /*
        let isErr = false;
        let swaggerObj = await fileHelper.readJsonFile(filePath).catch((err) => {
            res.refuse(err);
            isErr = true;
        });
        if (isErr) return;

        const swagMgObj = new SwaggerManage(swaggerObj);

        const apiRoute = req.body.apiRoute;
        const apiType = req.body.apiType;
        */

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        // 建構schema物件-----------------------------------------------------

        let schema = req.body.schema;
        let gSchema;
        if (!schema) { // 代表沒有直接輸入schema，要去gql庫裡抓
            // schema = GraphSchema.initSchemaByGraphTypeKey(req.body.rootType);
            // schema = SchemaManage.getSchema(req.body.rootType);

            gSchema = new GraphSchema(req.body.rootType);
        } else {
            gSchema = new GraphSchema(req.body.rootType, schema);
        }
        // if (!schema) {
        //     return res.refuse(`rootType not valid`);
        // }


        // console.log('gSchema', gSchema);

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