const SchemaManage = require('../graphQuery/schemaManage');
const checkRequired = require('../utils/checkRequired');


// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/createSchema', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['rootType', 'schema']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }
        // swagObj = await swagMgObj.save().catch(errHandle);
        // if (isErr) return;

        await SchemaManage.createSchema(req.body.rootType, req.body.schema).catch(errHandle);
        if (isErr) return;

        res.react(true);
    }
}
module.exports = apiData;