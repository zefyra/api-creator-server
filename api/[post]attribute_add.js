
const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require("../utils/PrehandleBuilder");

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/attribute/add', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        apiType: true,
        apiRoute: true,
        attrSrc: true,
        layerPath: true,
        name: true,
        attrData: true,
        /* attrData: {
            name: attrName,
            default: attrDefault,
            valueType: attrValueType,
            description: attrDescription,
            required: attrRequired,
        } */
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
            name: req.body.name,
            attrSrc: req.body.attrSrc, // 'reqBody', 'resBody'
        };

        await swagMgObj.addAttr(queryObj, req.body.attrData).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react({ result: true });
    }
}
module.exports = apiData;