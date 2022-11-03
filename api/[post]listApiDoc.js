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

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/listApiDoc', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        // const errList = checkRequired(req.body,
        //     ['fileName']);
        // // optional: 'tag'

        // // 'apiRoute', 'apiType', 'tags', 'summary'
        // if (errList.length !== 0) {
        //     return res.refuse("fail", errList);
        // }
        const fileName = req.body.fileName;

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        let apiDocList = await SwaggerManage.getApiDocList().catch(errHandle);
        if (isErr) return;

        res.react({
            list: apiDocList,
        });
    }
}
module.exports = apiData;