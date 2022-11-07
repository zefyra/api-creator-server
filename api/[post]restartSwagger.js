// const fs = require('fs');
// const path = require('path');

const ServerManage = require("../serverManage");
const SwaggerManage = require("../swaggerManage/swaggerManage");
const swaggerServer = require("../swaggerServer");

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
    apiRoute: '/api/restartSwagger', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body,
            ['fileName']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr = false;
        const errHandle = (err) => {
            res.refuse(err);
            isErr = true;
        }

        // await swaggerServer.createSwaggerServer(req.body.fileName);
        const swaggerServerObj = swaggerServer.getSwaggerServer();
        if (!swaggerServerObj) {
            return res.refuse(`swaggerServerObj not exist`);
        }

        // 關閉舊的server
        await ServerManage.closeServer(swaggerServerObj.serverName);
        if (isErr) return;

        console.log(`swagger server is closed, \`${swaggerServerObj.serverName}\``);

        // 重新初始化
        swaggerServerObj.initApiDocSwaggerServer();

        res.react(null);
    }
}
module.exports = apiData;