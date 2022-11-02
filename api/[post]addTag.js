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

        let isErr;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        // not required: 'description'
        const fileName = req.body.fileName;
        // const filePath = SwaggerManage.getFilePath(fileName);
        const swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (isErr) return;

        const name = req.body.name;
        const description = req.body.description || '';
        const groupName = req.body.groupName;

        // console.log('swagMgObj', swagMgObj);
        await swagMgObj.addTag(name, description, groupName).catch(errHandle);
        if (isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (isErr) return;

        res.react(swagObj);

        // const jsonContent = swagMgObj.getJson();
        // // 將檔案存回去
        // fileHelper.writeFile(filePath, jsonContent).then(() => {
        //     res.react(swagMgObj.getObj());
        // }).catch((err) => {
        //     console.error('err', err)
        //     res.refuse(`error`, err);
        // });
    }
}
module.exports = apiData;