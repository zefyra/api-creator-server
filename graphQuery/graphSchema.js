
const path = require('path');
const fs = require('fs');
const gql = require('graphql-tag');

const PathLoader = require('../utils/pathLoader');

const GraphTypeDef = require('./graphTypeDef');


/*
const schemaFolderPath = './schema';
const schemaFileNameList = loadPath.loadPathFileList(path.join(__dirname, schemaFolderPath));
console.log('schemaFileNameList', schemaFileNameList)

*/


const schemaMap = {};

const autoLoadSchema = function () {
    // 只篩出.gql檔
    const gqlFileFileter = function (fileName) {
        return /\.gql$/.test(fileName);
    }

    const fileInfoList = new PathLoader(path.join(__dirname, './schema'), gqlFileFileter).load();

    console.log('fileInfoList', fileInfoList)

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

class GraphSchema {
    // constructor(graphTypeKey) {
    //     console.log('GraphSchema', graphTypeKey);
    //     console.log('schemaContext', schemaContext);
    // }
    rootType = '';
    schema = null;
    gqlObj = null;
    typeDefList = [];
    rootTypeDef = null;

    constructor(graphKey, schema) {

        if (!schema) {
            schema = schemaMap[graphKey];
        }

        if (!schema) {
            console.error(`GraphSchema: schema not found`);
            return;
        }

        this.rootType = graphKey;
        this.schema = schema;

        // 載入schema，並創建成gql物件
        const gqlObj = gql`
            ${this.schema}
        `;
        this.gqlObj = gqlObj;
        console.log('gqlObj', gqlObj)

        this.typeDefList = this.loadTypeDefs();

        this.rootTypeDef = this.getRootTypeDef(this.typeDefList, this.rootType);
        if (!this.rootTypeDef) {
            console.error(`GraphValidate: rootTypeDef not found`);
            return;
        }

        // console.log(`rootTypeDef name`, this.rootTypeDef.name);
    }

    // 將最上層的type都載入，並且找出rootType
    loadTypeDefs() {
        // 'ObjectTypeDefinition': 代表只篩出Type
        return this.gqlObj.definitions.filter((typeDefObj) => (typeDefObj.kind === 'ObjectTypeDefinition'))
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
}


module.exports = GraphSchema;