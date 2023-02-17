
const SwaggerManage = require('../swaggerManage/swaggerManage');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

const checkRequired = require('../utils/checkRequired');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/attribute/remove', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiType: true,
        apiRoute: true,
        attrSrc: true,
        layerPath: true,
        name: true,
    }),
    handle: async function (req, res) {
        let isErr;
        const errHandle = (err) => {
            console.error(`err`, err);
            res.refuse(err);
            isErr = true;
        }

        const fileName = req.body.fileName;
        const swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const queryObj = {
            apiType: req.body.apiType,
            apiRoute: req.body.apiRoute,
            layerPath: req.body.layerPath,
            attrSrc: req.body.attrSrc,
            name: req.body.name,
        };

        await swagMgObj.removeAttr(queryObj).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react({ result: true });
    }
}
module.exports = apiData;