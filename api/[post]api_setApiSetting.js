const SwaggerManage = require("../swaggerManage/swaggerManage");

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/api/setApiSetting', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiRoute: true,
        apiType: true,
        summary: false,
        securityKey: false,
        apiRouteVar: false,
        apiTypeVar: false,
    }),
    handle: async function (req, res) {
        const fileName = req.body.fileName;

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const apiRoute = req.body.apiRoute;
        const apiType = req.body.apiType;
        const summary = req.body.summary;
        const securityKey = req.body.securityKey;

        const apiRouteVar = req.body.apiRouteVar;
        const apiTypeVar = req.body.apiTypeVar;

        if (summary) {
            await swagMgObj.setApiSummary(apiRoute, apiType, summary).catch(errHandle);
            if (isErr) return;
        }

        if (securityKey) {
            await swagMgObj.setApiSecurity(apiRoute, apiType, securityKey).catch(errHandle);
            if (isErr) return;
            /* 	securityList: [{
                    "Token": []
                }], */
        }

        if (apiRouteVar || apiTypeVar) {
            await swagMgObj.moveApi(apiRoute, apiType, apiRouteVar, apiTypeVar).catch(errHandle);
            if (isErr) return;
        }

        swagMgObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagMgObj);
    }
}
module.exports = apiData;