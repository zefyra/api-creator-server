
const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/editTag', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body, ['fileName', 'tagName', 'summary']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        const fileName = req.body.fileName;
        const swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const tagName = req.body.tagName;
        const summary = req.body.summary;
        await swagMgObj.editTag(tagName, summary).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);
    }
}
module.exports = apiData;