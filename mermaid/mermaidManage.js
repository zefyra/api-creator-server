const path = require('path');
const PathLoader = require('../utils/pathLoader');
const mermaidParser = require('./mermaidParser');


const flowMap = {};
/* {
    // <flowKey(FILE_NAME)>: <flowObj>
    <flowKey>: {
        nodeMap: {...},
        nodeDirList: [{
            ...<nodeObj>,
            dirList
        }]
    }
} */

class MermaidManage {
    // constructor(){}
    static async parse(str) {
        return new Promise((resolve, reject) => {
            let obj;
            try {
                obj = mermaidParser(str);
            } catch (err) {
                return reject(err);
            }
            resolve(obj);
        });
    }

    static getFilePath(fileName) {
        if (!fileName) {
            // 只丟出資料夾路徑
            return path.join(__dirname, `./flowchart`);
        }
        return path.join(__dirname, `./flowchart/${fileName}.json`);
    }

    static async initMermaidFlowchart() {

        const folderPath = MermaidManage.getFilePath();

        const loader = new PathLoader(folderPath, (fileName) => /\.mmd$/.test(fileName))
        /* newApiDocList: [{fileName: 'api-creator.json',
        path: 'c:\\ServerProject\\api-creator-server\\public\\apiDoc/api-creator.json'}] */

        let isErr = false;
        const errHandle = (err) => {
            isErr = true;
            console.error(err)
        };

        const fileInfoList = await loader.load().catch(errHandle);
        if (isErr) return;
        /* fileInfoList: [{ fileName: 'ccccc.mmd',
        path: 'c:\\ServerProject\\api-creator-server\\mermaid\\flowchart/ccccc.mmd' }] */
        // console.log('mmd fileList', fileInfoList);

        let mmdFileInfoList = [];
        await loader.loadEachFile(async (fileInfo, textData) => {
            mmdFileInfoList.push({
                // fileName: fileInfo.fileName,
                // path: fileInfo.path,
                ...fileInfo,
                mermaid: textData,
            });
        }).catch(errHandle);
        if (isErr) return;

        // // 先只處理第一個
        // const flowObj = await MermaidManage.parse(mmdFileInfoList[0].mermaid).catch(errHandle);
        // if (isErr) return;
        // console.log('nodeDirList', flowObj.nodeDirList);

        for (let i = 0; i < mmdFileInfoList.length; i += 1) {
            const mmdFileObj = mmdFileInfoList[i];
            const flowObj = await MermaidManage.parse(mmdFileObj.mermaid).catch(errHandle);
            if (isErr) return;

            // 去除附檔名，取得flowKey
            const flowKey = mmdFileObj.fileName.replace(/\.[^/.]+$/, "");

            console.log(`load flow => \`${flowKey}\``);
            // console.log('nodeDirList', flowObj.nodeDirList);

            flowMap[flowKey] = flowObj;
        }

        console.log('flowMap', flowMap)
    }

    static getFlow(flowKey) {
        return flowMap[flowKey];
    }

    static async runFlow(flowKey, func) {
        const flowObj = MermaidManage.getFlow(flowKey);
        const startNode = flowObj.nodeDirList[0];

        const nodeMap = flowObj.nodeMap;
        const getNode = function (code) {
            return nodeMap[code];
        };

        // console.log();

        // 深度優先搜尋
        const runNode = async function (nodeObj) {
            // console.log(`node`, nodeObj.code);
            await func(nodeObj);

            if (nodeObj.dirList.length === 0) { // end
                return;
            }

            for (let i = 0; i < nodeObj.dirList.length; i += 1) {
                let dirObj = nodeObj.dirList[i];
                const nextNode = getNode(dirObj.end.code);
                if (!nextNode) {
                    console.error('runFlow: nextNode not found')
                }
                await runNode(nextNode);
            }
        }

        await runNode(startNode);
    }
}

module.exports = MermaidManage;