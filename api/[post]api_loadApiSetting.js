const SwaggerManage = require("../swaggerManage/swaggerManage");

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/api/loadApiSetting', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiRoute: true,
        apiType: true,
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

        const securityList = await swagMgObj.loadApiSecurity(apiRoute, apiType).catch(errHandle);
        if (isErr) return;
        /* 	securityList: [{
                "Token": []
            }], */

        res.react({
            security: securityList,
        });

        // swagMgObj = await swagMgObj.save().catch(errHandle);
        // if (isErr) return;

        // res.react(swagMgObj);
    }
}
module.exports = apiData;