
const path = require('path');
const fs = require('fs');
const gql = require('graphql-tag');

const PathLoader = require('../utils/pathLoader');

const GraphTypeDef = require('./graphTypeDef');

const Kind = require('./Kind');

/*
const schemaFolderPath = './schema';
const schemaFileNameList = loadPath.loadPathFileList(path.join(__dirname, schemaFolderPath));
console.log('schemaFileNameList', schemaFileNameList)

*/

/*
const schemaMap = {};

const autoLoadSchema = function () {
    // 只篩出.gql檔
    const gqlFileFileter = function (fileName) {
        return /\.gql$/.test(fileName);
    }

    const fileInfoList = new PathLoader(path.join(__dirname, './schema'), gqlFileFileter).load();

    // console.log('fileInfoList', fileInfoList)

    // 載入所有.gql檔案的字串
    fileInfoList.forEach((fileInfo) => {

        // 去除附檔名，取得graphTypeKey
        const graphTypeKey = fileInfo.fileName.replace(/\.[^/.]+$/, "");

        console.log(`load gql => \`${graphTypeKey}\``);

        fs.readFile(fileInfo.path, 'utf8', function (err, data) {
            if (err) throw err;
            schemaMap[graphTypeKey] = data;

            // const gSchema = new GraphSchema(graphTypeKey, data);
            // console.log('gSchema', gSchema);
        });
    });
}

// 自動載入所有schema
autoLoadSchema();
*/

class GraphSchema {
    // constructor(graphTypeKey) {
    //     console.log('GraphSchema', graphTypeKey);
    //     console.log('schemaContext', schemaContext);
    // }
    rootType = '';

    // gql模式-----------------------------------
    schema = null;
    gqlObj = null;
    typeDefList = [];
    rootTypeDef = null;

    // buildSwagObjMap()-----------------------
    swagObjMap = {};

    // $ref參照模式-----------------------------------
    isRef = false;

    constructor(rootType, schema) {
        // if (!schema) {
        //     console.error(`GraphSchema: schema not found`);
        //     return;
        // }

        if (!schema) {
            // 代表要使用$ref參照模式
            this.rootType = rootType;
            this.isRef = true;
            return;
        }

        this.rootType = rootType;
        this.schema = schema;

        // 載入schema，並創建成gql物件
        const gqlObj = gql`
            ${this.schema}
        `;
        this.gqlObj = gqlObj;
        console.log('gqlObj', gqlObj)

        this.typeDefList = this.loadTypeDefs(Kind.InputObjectTypeDefinition); // Kind.ObjectTypeDefinition

        this.rootTypeDef = this.getRootTypeDef(this.typeDefList, this.rootType);
        if (!this.rootTypeDef) {
            console.error(`GraphValidate: rootTypeDef not found`);
            return;
        }

        // console.log(`rootTypeDef name`, this.rootTypeDef.name);
    }

    // 將最上層的type都載入，並且找出rootType
    loadTypeDefs(kind) {
        // 'InputObjectTypeDefinition': 代表只篩出input
        // 'ObjectTypeDefinition': 代表只篩出Type
        return this.gqlObj.definitions.filter((typeDefObj) => (typeDefObj.kind === kind))
            .map((typeDefObj) => new GraphTypeDef(typeDefObj, this));
    }

    // [private]
    getRootTypeDef(typeDefList, rootType) {
        return typeDefList.find((graphTypeDefObj) => graphTypeDefObj.name === rootType);
    }

    // [public]
    findTypeDef(fieldType) {
        return this.typeDefList.find((typeDefObj) => fieldType === typeDefObj.name)
    }

    // [public] 建構所有typeDefList
    buildSwagObjMap() {
        const vm = this;
        let buildFail = false;

        // const buildCheckedList = this.typeDefList.map();

        const typeDefMap = {};

        // this.typeDefList

        let leakTypeErrStr = '';

        // 跑一圈
        const run = function () {
            // <GraphTypeDef>

            let haveBuildList = [];

            vm.typeDefList.forEach((gTypeDefObj) => {
                // <GraphTypeDef>

                if (typeDefMap[gTypeDefObj.name]) {
                    return; // 代表已建構完成，略過
                }

                const leakTypeList = gTypeDefObj.checkPropertiesDefinition(typeDefMap);
                if (leakTypeList.length === 0) { // ready
                    // 代表需要的typeDef已經建構完成，可以進一步建構
                    typeDefMap[gTypeDefObj.name] = gTypeDefObj.buildSwagObj();
                    haveBuildList.push(gTypeDefObj.name);
                } else {
                    let leakTypeStr = '';
                    leakTypeList.forEach((leakType, index) => {
                        leakTypeStr += `${leakType}`;
                        if (index !== (leakTypeList.length - 1)) {
                            leakTypeStr += ', ';
                        }
                    });

                    leakTypeErrStr = `[${gTypeDefObj.name}] typeDef leaks ${leakTypeStr}`;
                }
            });

            return haveBuildList;
        }

        while (Object.keys(typeDefMap).length !== this.typeDefList.length) {
            let buildList = run();

            console.log(`build`, buildList);
            if (buildList.length === 0) {
                console.error(leakTypeErrStr);
                console.error(`no any typeDef build in one run`);
                buildFail = true;
                break;
            }
        }

        this.swagObjMap = typeDefMap;

        return buildFail ? leakTypeErrStr : null;
    }

    getRootSwagObj() {
        return this.swagObjMap[this.rootTypeDef.name];
    }
}


module.exports = GraphSchema;