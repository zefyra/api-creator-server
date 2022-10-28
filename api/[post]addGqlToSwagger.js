const fs = require('fs');
const path = require('path');

const GraphType = require('../graphQuery/graphType');

// const GraphValidate = require('../graphQuery/graphValidate.js');
const GraphSchema = require('../graphQuery/graphSchema');
const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/addGqlToSwagger', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
             ['graphTypeKey', 'fileName', 'apiRoute', 'apiType', 'target']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        const graphTypeKey = req.body.graphTypeKey;
        const fileName = req.body.fileName;
        const target = req.body.target;

        // 建構schema物件-----------------------------------------------------
        const keyValid = GraphType.checkValidKey(graphTypeKey);
        if (!keyValid) {
            res.refuse(`graphTypeKey is invalid`);
            return;
        }

        const gSchema = new GraphSchema(graphTypeKey);
        // console.log('gSchema', gSchema);

        // 讀取json檔-----------------------------------------------------
        let isErr = false;
        let swaggerObj = await fileHelper.readJsonFile(filePath).catch((err) => {
            res.refuse(err);
            isErr = true;
        });
        if (isErr) return;

        const swagMgObj = new SwaggerManage(swaggerObj);

        const apiRoute = req.body.apiRoute;
        const apiType = req.body.apiType;

        // 未完成: 先檢查該route的API是否存在
        




        // if (target === 'body') {
        //     // 代表要把schema加在body內
        //     swagMgObj.addBody(gSchema);
        // }


            // 未完成: 還要把gSchema加入body

            res.react(true);
    }
}
module.exports = apiData;