
const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/editAttr', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body, ['fileName', 'apiType', 'apiRoute',
            'tags', 'attrName', 'layerPath', 'attrSrc', 'attrData']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

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
            tags: req.body.tags,
            attrName: req.body.attrName,
            layerPath: req.body.layerPath,
            attrSrc: req.body.attrSrc,
        };

        await swagMgObj.editAttr(queryObj, req.body.attrData).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;