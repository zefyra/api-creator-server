const SwaggerManage = require("../swaggerManage/swaggerManage");

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/doc/loadSecurity', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
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

        const securityList = await swagMgObj.getDocSecurity().catch(errHandle);
        if (isErr) return;

        res.react({
            security: securityList.map((obj) => {
                // return {
                //     "type": "apiKey",
                //     "name": "authorization",
                //     "in": "header",
                //     "description": "login取得的token"
                //     "securityKey": "Token"
                // }
                return {
                    "type": obj.type,
                    "name": obj.name,
                    "in": obj.in,
                    "description": obj.description,
                    "securityKey": obj.securityKey,
                }
            }),
        });
    }
}
module.exports = apiData;