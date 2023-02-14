
const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const PrehandleBuilder = require('../utils/PrehandleBuilder');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/attribute/edit/path', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        // queryObj----------------------------------
        apiType: true,
        apiRoute: true,
        tags: true,
        attrName: true,
        // attrSrc: true,
        // attrData----------------------------------
        // layerPath: true, // 不需要判斷層
        attrData: true,
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
            tags: req.body.tags,
            attrName: req.body.attrName,
            // layerPath: req.body.layerPath,
            // attrSrc: req.body.attrSrc,
        };

        await swagMgObj.editAttrInPath(queryObj, req.body.attrData).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;