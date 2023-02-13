const SwaggerManage = require("../swaggerManage/swaggerManage");

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/example/add/:mode', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiType: true,
        apiRoute: true,
        name: true,
        schema: true,
    }),
    handle: async function (req, res) {
        const fileName = req.body.fileName;

        const mode = req.params.mode; // 'reqBody', 'resBody' 
        if (!mode) {
            res.refuse(`[post]example_add: mode not exist`);
            return;
        }

        const jsonSchema = req.body.schema;
        let schema = {};
        try {
            schema = JSON.parse(jsonSchema);
        } catch (err) {
            // 代表json parse失敗
            console.error(err);
            res.refuse(`[post]example_add: json parse fail`);
            return;
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const apiRoute = req.body.apiRoute;
        const apiType = req.body.apiType;
        const name = req.body.name;

        await swagMgObj.addExample(apiRoute, apiType, mode, name, schema).catch(errHandle);
        if (isErr) return;

        // res.react({ result: 'success' });

        swagMgObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagMgObj);


        // const apiRoute = req.body.apiRoute;
        // const apiType = req.body.apiType;
        // const summary = req.body.summary;
        // const securityKey = req.body.securityKey;

        // if (summary) {
        //     await swagMgObj.setApiSummary(apiRoute, apiType, summary).catch(errHandle);
        //     if (isErr) return;
        // }

        // if (securityKey) {
        //     await swagMgObj.setApiSecurity(apiRoute, apiType, securityKey).catch(errHandle);
        //     if (isErr) return;
        //     /* 	securityList: [{
        //             "Token": []
        //         }], */
        // }

        // swagMgObj = await swagMgObj.save().catch(errHandle);
        // if (isErr) return;

        // res.react(swagMgObj);
    }
}
module.exports = apiData;