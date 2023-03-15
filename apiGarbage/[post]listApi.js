// const fs = require('fs');
// const path = require('path');

const SwaggerManage = require("../swaggerManage/swaggerManage");

// const GraphType = require('../graphQuery/graphType');

// // const GraphValidate = require('../graphQuery/graphValidate.js');
// const GraphSchema = require('../graphQuery/graphSchema');
// const GraphSwagger = require('../graphQuery/graphSwagger');

// const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
// const fileHelper = require('../utils/fileHelper');


// 這支API沒用到


// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/listApi', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['fileName']);
        // optional: 'tag'

        // 'apiRoute', 'apiType', 'tags', 'summary'
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }
        const fileName = req.body.fileName;

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        // const apiRoute = req.body.apiRoute;
        // const apiType = req.body.apiType;
        // const tags = req.body.tags;
        // const summary = req.body.summary;

        const apiList = await swagMgObj.listApi(req.body.tag).catch(errHandle);
        if (isErr) return;

        res.react({
            list: apiList,
        });
    }
}
module.exports = apiData;