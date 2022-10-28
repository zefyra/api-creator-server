// const fs = require('fs');
const path = require('path');

// const GraphType = require('../graphQuery/graphType');

// // const GraphValidate = require('../graphQuery/graphValidate.js');
// const GraphSchema = require('../graphQuery/graphSchema');
// const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/addTag', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body, ['fileName', 'name', 'groupName']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        // not required: 'description'
        const fileName = req.body.fileName;
        const filePath = path.join(__dirname, `../swagger/${fileName}.json`);

        let isErr = false;
        let swaggerObj = await fileHelper.readJsonFile(filePath).catch((err) => {
            res.refuse(err);
            isErr = true;
        });
        if (isErr) return;

        const swagMgObj = new SwaggerManage(swaggerObj);

        const name = req.body.name;
        const description = req.body.description || '';
        const groupName = req.body.groupName;

        // console.log('swagMgObj', swagMgObj);
        swagMgObj.addTag(name, description, groupName);

        const jsonContent = swagMgObj.getJson();
        // 將檔案存回去
        fileHelper.writeFile(filePath, jsonContent).then(() => {
            res.react(swaggerObj);
        }).catch((err) => {
            res.refuse(`error`, err);
        });
    }
}
module.exports = apiData;