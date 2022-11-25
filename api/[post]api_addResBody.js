
const GraphSchema = require('../graphQuery/graphSchema');
const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const SchemaManage = require('../graphQuery/schemaManage')
const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require('../utils/PrehandleBuilder');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/api/addResBody', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiRoute: true,
        apiType: true,
        rootType: true,
        resType: true,
    }),
    handle: async function (req, res) {
        // const errList = checkRequired(req.body,
        //     ['fileName', 'apiRoute', 'apiType', 'rootType', 'resType']);
        // if (errList.length !== 0) {
        //     return res.refuse("fail", errList);
        // }

        // optional: 'schema'

        if (!req.body.rootType && !req.body.schema) {
            return res.refuse('fail', `\`rootType\` or \`schema\`, must have one`);
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }
        // swagObj = await swagMgObj.save().catch(errHandle);
        // if (isErr) return;

        let swagMgObj = await SwaggerManage.initByFileName(req.body.fileName).catch(errHandle);
        if (isErr) return;

        let schema = req.body.schema;
        if (!schema) { // 代表沒有直接輸入schema，要去gql庫裡抓
            // schema = GraphSchema.initSchemaByGraphTypeKey(req.body.rootType);
            schema = SchemaManage.getSchema(req.body.rootType);
        }
        if (!schema) {
            return res.refuse(`rootType not valid`);
        }

        const gSchema = new GraphSchema(req.body.rootType, schema);


        // 加入response-----------------------------------------------------
        let swagObj;
        swagObj = await swagMgObj.addResponse(req.body.apiType, req.body.apiRoute,
            req.body.resType, gSchema, req.body.description).catch(errHandle);
        if (isErr) return;

        swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;