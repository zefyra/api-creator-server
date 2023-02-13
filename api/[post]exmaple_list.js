const SwaggerManage = require("../swaggerManage/swaggerManage");

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/example/list', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiType: true,
        apiRoute: true,
        mode: true
    }),
    handle: async function (req, res) {
        const fileName = req.body.fileName;
        const apiType = req.body.apiType;
        const apiRoute = req.body.apiRoute;
        const mode = req.body.mode;

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const exampleList = await swagMgObj.getExampleList(apiRoute, apiType, mode).catch(errHandle);
        if (isErr) return;

        res.react({
            list: exampleList,
        });
    }
}
module.exports = apiData;