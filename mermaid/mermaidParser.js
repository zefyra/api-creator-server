const NodeType = require("../enum/mermaid/NodeType");

const parseLineList = function (mermaidString) {

    // 將每一列拆開
    const arrayOfLines = mermaidString.match(/[^\r\n]+/g);
    // console.log('arrayOfLines', arrayOfLines)
    /* arrayOfLines: [
        0: 'flowchart TD',
        1: '    A[Deploy] --> B{is it Fri?}',
        2: '    B -- Yes --> C[Do not deploy!]',
        3: '    B -- No --> D[Run install.sh to deploy!]',
        4: '    B -->|Three| F[AAA:BBB]',
        5: '    D --> E',
        6: '    C --> E',
    ] */

    if (arrayOfLines.length === 0) {
        throw `mermaid parser: arrayOfLines is empty`;
    }

    // 讀取首行資料，檢查資料格式
    const firstLine = arrayOfLines[0];
    let lineWordList = firstLine.split(' ');
    if (lineWordList.length === 0) {
        throw `mermaid parser: flowchart definition not exist`;
    }
    if (lineWordList[0] !== 'flowchart') { // 只接受flowchart格式
        throw `mermaid parser: not flowchart`;
    }

    // 去除頭尾空白字元
    const trim = function (line) { // '   A   ' ==> 'A'
        return line.replace(/^\s+|\s+$/g, '');
        // text.replace(/^\s+|\s+$/gm,'');
        // text.trim();
    }

    const removeDoubleQuote = function (label) {
        return label.replace(/['"]+/g, '');
    }

    const parseCode = function (uri) {
        return trim(uri); // 單純最後剩下來的就會是code
        // let result = uri.match(/\.\/(.*)\.gql/) // './AABBCC.gql' => 'AABBCC'
        // const code = result ? result[1] : '';
        // return;
    }

    const parseTitle = function (uri) {
        /* let uri = "A[Deploy]"
        let result = uri.match(/\[(.*)\]/) // './AABBCC.gql' => 'AABBCC'
        const code = result ? result[1] : ''; */
        let result = uri.match(/\[(.*)\]/) // 'A[Deploy]' => 'Deploy'
        return removeDoubleQuote(result ? result[1] : '');
    };

    const removeTitle = function (uri) { // 將 '[xxxx]' 的部分去除掉
        // let uri = "|Three| F[AAA:BBB]"
        // let result = uri.replace(/\[(.*)\]/, '')
        return uri.replace(/\[(.*)\]/, '');
    }

    const parseCase = function (uri) {
        /* let uri = "|Three| F[AAA:BBB]"
        let result = uri.match(/\|(.*)\|/)
        const code = result ? result[1] : ''; */
        let result = uri.match(/\|(.*)\|/); // '|Three| F[AAA:BBB]' ===> 'Three'
        return result ? result[1] : '';
    };

    const removeCase = function (uri) {
        return uri.replace(/\|(.*)\|/, ""); // "|Three| F[AAA:BBB]" ===> " F[AAA:BBB]"
    }

    const parseCondition = function (uri) {
        let result = uri.match(/\{(.*)\}/);
        return removeDoubleQuote(result ? result[1] : '');
    }
    const removeCondition = function (uri) {
        return uri.replace(/\{(.*)\}/, "");
    }

    const dirInfoList = [];

    const getNodeType = function (title, condition) {
        if (condition) {
            return NodeType.condition;
        } else if (title) {
            return NodeType.node;
        }
        return NodeType.node;
    };
    const getNode = function (mode, title, condition, caseStr, code) {
        // mode: 'start' or 'end'
        // if (mode === 'start') {

        const nodeType = getNodeType(title, condition);
        if (!nodeType) {
            console.error('getNode: node type unknown');
            return null;
        }

        return {
            type: nodeType,
            label: condition || title,
            case: caseStr,
            code: code,
        };
    }

    for (let i = 1; i < arrayOfLines.length; i += 1) {
        let line = arrayOfLines[i];
        // 去除頭尾空白字元
        line = trim(line);

        let dirStrList = line.split('-->');

        let startUri = trim(dirStrList[0]);
        let endUri = trim(dirStrList[1]);

        // start point
        const startTitle = parseTitle(startUri);
        startUri = removeTitle(startUri);
        startUri = trim(startUri);
        const startCase = parseCase(startUri);
        startUri = removeCase(startUri);
        startUri = trim(startUri);
        const startCondition = parseCondition(startUri);
        startUri = removeCondition(startUri);
        startUri = trim(startUri);

        const startCode = parseCode(startUri);

        // end point
        const endTitle = parseTitle(endUri);
        endUri = removeTitle(endUri);
        endUri = trim(endUri);
        const endCase = parseCase(endUri);
        endUri = removeCase(endUri);
        endUri = trim(endUri);
        const endCondition = parseCondition(endUri);
        endUri = removeCondition(endUri);
        endUri = trim(endUri);

        const endCode = parseCode(endUri);

        // console.log('code', startCode, endCode);

        const startNode = getNode('start', startTitle, startCondition, startCase, startCode)
        const endNode = getNode('end', endTitle, endCondition, endCase, endCode);
        if (!startNode) {
            throw `startNode no nodeType: ${line}`;
        }
        if (!startNode.code) {
            throw `startNode fail: ${line}`;
        }
        if (!endNode) {
            throw `endNode no nodeType: ${line}`;
        }
        if (!endNode.code) {
            throw `endNode fail: ${line}`;
        }

        dirInfoList.push({
            start: startNode,
            end: endNode,
            // start: { // <node>
            //     title: startTitle || startCondition,
            //     type: nodeType,
            //     // 大括弧裡面的描述
            //     case: startCase,
            // }
        });
    }


    return dirInfoList;
}

const nodeTypePriority = NodeType.getPriority();

const parseNodeList = function (lineInfoList) {

    const nodeMap = {};

    const registNode = function (code, obj) {
        if (!nodeMap[code]) { // 代表裡面是空的，直接塞進去即可
            nodeMap[code] = obj;
            return
        }

        // 刷新nodeType
        const newNodeType = NodeType.autoGetNodeType(nodeMap[code].type, obj.type);
        if (!newNodeType) {
            console.error(`autoGetNodeType fail`);
            return;
        }
        nodeMap[code].type = newNodeType;
    }

    lineInfoList.forEach((lineInfo) => {
        registNode(lineInfo.start.code, lineInfo.start);
        registNode(lineInfo.end.code, lineInfo.end);
    });

    const nodeList = Object.keys(nodeMap).map((code) => {
        return {
            code,
            ...nodeMap[code]
        };
    }).sort(function (a, b) {
        if (a.code < b.code) {
            return -1;
        }
        if (a.code > b.code) {
            return 1;
        }
        return 0;
    });

    return nodeList;
};
const applyDirInfo = function (nodeInfoList, lineInfoList) {

    // 找出所有該code為起點的line
    const findAllStartLine = function (code) {
        return lineInfoList.filter((lineInfo) => {
            return lineInfo.start.code === code;
        });
    }

    let nodeDirList = nodeInfoList.map((nodeObj) => {
        const lineInfoList = findAllStartLine(nodeObj.code);
        return {
            ...nodeObj,
            dirList: lineInfoList,
        };
    });

    return nodeDirList;
}

module.exports = function (mermaidString) {
    const lineInfoList = parseLineList(mermaidString);

    const nodeInfoList = parseNodeList(lineInfoList);

    // console.log('nodeInfoList', nodeInfoList);

    const nodeDirList = applyDirInfo(nodeInfoList, lineInfoList);

    const nodeMap = {};
    nodeDirList.forEach((nodeObj) => {
        nodeMap[nodeObj.code] = { ...nodeObj };
    });

    return {
        // lineList: lineInfoList,
        nodeMap: nodeMap,
        // nodeList: nodeInfoList,
        nodeDirList: nodeDirList,
    };
}