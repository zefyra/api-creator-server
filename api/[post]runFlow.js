const MermaidManage = require("../mermaid/mermaidManage");
const checkRequired = require('../utils/checkRequired');

// 生成gql檔
const apiData = {
    apiType: 'post',
    reactType: 'rest', // 'json', // raw
    apiRoute: '/api/flow/run', // 指定API路由

    // prehandleList: ['checkRequired'],
    // checkRequired: {
    //     checkBody: ['flow'],
    // },

    preRequestScript: async function () {

    },
    handle: async function (req, res) {
        const errList = checkRequired(req.body, ['flow']);
        if (errList.length !== 0) {
            return res.refuse("fail", errList);
        }

        let isErr;
        const errHandle = (err) => {
            console.error(`err`, err);
            res.refuse(err);
            isErr = true;
        }


        const logList = [];
        await MermaidManage.runFlow(req.body.flow, function (nodeObj) {
            // console.log(`node[${nodeObj.code}]`, nodeObj);
            // node[A]: {code: 'A', type: 'node', label: 'Deploy', case: '', dirList: Array(1)}
            // node[B]: {code: 'B', type: 'condition', label: 'is it Fri?', case: '', dirList: Array(3)}
            logList.push({
                code: nodeObj.code,
                label: nodeObj.label,
            });
        }).catch(errHandle);
        if (isErr) return;

        res.react({
            logList: logList,
        });
    }
}
module.exports = apiData;