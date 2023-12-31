// const fs = require('fs');
const path = require('path');

// const GraphType = require('../graphQuery/graphType');

// // const GraphValidate = require('../graphQuery/graphValidate.js');
// const GraphSchema = require('../graphQuery/graphSchema');
// const GraphSwagger = require('../graphQuery/graphSwagger');

const SwaggerManage = require('../swaggerManage/swaggerManage');

const checkRequired = require('../utils/checkRequired');
const fileHelper = require('../utils/fileHelper');
const ErrorHandle = require('../utils/errorHandle.js');
const PrehandleBuilder = require('../utils/PrehandleBuilder');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/tag/add', // 指定API路由
    prehandle: new PrehandleBuilder().checkRequired({
        fileName: true,
        name: true,
        description: true,
        // groupName: true,
    }),
    handle: async function (req, res) {

        const eh = new ErrorHandle(error => res.refuse(error));
        const errHandle = eh.catchor();

        const fileName = req.body.fileName;
        const swagMgObj = await SwaggerManage.initByFileName(fileName).catch(errHandle);
        if (eh.isErr) return;

        const name = req.body.name;
        const description = req.body.description || '';
        // const groupName = req.body.groupName;

        await swagMgObj.addTag(name, description).catch(errHandle);
        // , groupName
        if (eh.isErr) return;

        const swagObj = await swagMgObj.save().catch(errHandle);
        if (eh.isErr) return;

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