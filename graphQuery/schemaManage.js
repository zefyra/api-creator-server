
const path = require('path');
const fs = require('fs');

const PathLoader = require('../utils/pathLoader');
const fileHelper = require('../utils/fileHelper');

const schemaMap = {};
const gqlSchemaList = [];

class SchemaManage {
    // static initSchemaByGraphTypeKey() {
    //     const keyValid = GraphType.checkValidKey(graphTypeKey);
    //     if (!keyValid) {
    //         return null;
    //     }
    //     return schemaMap[graphKey];
    // }
    static getSwaggerRefDefinition(gSchema) {
        return {
            "$ref": `#/definitions/${gSchema.rootType}`, // "#/definitions/app.Response"   
        };
    }
    static createSchema(rootType, schema) {
        if (!rootType) {
            console.error(`rootType not exist`);
            return;
        }
        if (!schema) {
            console.error(`schema not exist`);
            return;
        }

        const filePath = path.join(__dirname, `./schema/${rootType}.gql`);

        return fileHelper.writeFile(filePath, schema);
    }
    static getSchema(graphTypeKey) {
        // const keyValid = GraphType.checkValidKey(graphTypeKey);
        // if (!keyValid) {
        //     console.error(`graphTypeKey is invalid`, graphTypeKey);
        //     return null;
        // }
        return schemaMap[graphTypeKey];
    }
    static listSchema() {
        return gqlSchemaList;
    }
    static autoLoadSchema() {
        // 只篩出.gql檔
        const gqlFileFileter = function (fileName) {
            return /\.gql$/i.test(fileName);
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

                gqlSchemaList.push({
                    name: graphTypeKey,
                });

                // const gSchema = new GraphSchema(graphTypeKey, data);
                // console.log('gSchema', gSchema);
            });
        });
    }
}


// 自動載入所有schema
SchemaManage.autoLoadSchema();

module.exports = SchemaManage;