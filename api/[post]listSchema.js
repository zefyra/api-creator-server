const SchemaManage = require('../graphQuery/schemaManage')


// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/listSchema', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        // const errList = checkRequired(req.body,
        //     ['fileName', 'apiRoute', 'apiType', 'rootType']);
        // if (errList.length !== 0) {
        //     return res.refuse("fail", errList);
        // }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }
        // swagObj = await swagMgObj.save().catch(errHandle);
        // if (isErr) return;

        res.react({
            list: SchemaManage.listSchema(),
        });
    }
}
module.exports = apiData;