// import { gqlValidate } from 'gql-validate';
// import configureGqlValidate from 'gql-validate';
// import gql from "graphql-tag";
const gql = require('graphql-tag');

const Kind = require('./Kind');
// Int: 整數
// Float: 浮點數
// String: UTF‐8 字串
// Boolean: True or False.
// ID: 識別碼(不支持)


class NamedType {
    static Int = 'Int';

    static Float = 'Float';

    static String = 'String';

    static Boolean = 'Boolean';

    // 檢查是否為基本型態
    static checkBasicType(fieldName) {
        const checkMap = {
            [NamedType.Int]: true,
            [NamedType.Float]: true,
            [NamedType.String]: true,
            [NamedType.Boolean]: true,
        }
        return checkMap[fieldName] === true;
    }
}

class ValueValidate {
    // 驗證數值
    static validateValue(fieldType, value) {
        // console.log(`validateValue => ${fieldType}:`, JSON.stringify(value));

        if (fieldType === NamedType.Int) {
            return Number.isInteger(value);
        } else if (fieldType === NamedType.Float) { // 判斷是否為浮點數
            return typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value);
        } else if (fieldType === NamedType.Boolean) {
            return typeof value === 'boolean';
        } else if (fieldType === NamedType.String) {
            return typeof value === 'string';
        }
        console.error(`validateValue: fieldType ${fieldType} not support`);
        return false;
    }

    static checkValueNull(value) {
        return value == null;
    }
}

class GraphField {
    graphSchemaObj = null; // <GraphSchema>(上層)

    fieldKind = ''; // 'NamedType', 'NonNullType'

    wrapKindList = [];

    fieldName = ''; // 'data',

    fieldType = ''; // 'Int', 'Permission' (NamedType)

    isBasicType = true;

    hasError = false;

    isNonNull = false;

    isListType = false;

    defaultValueKind = null;

    defaultValue = null;

    constructor(fieldObj, graphSchemaObj) {
        this.graphSchemaObj = graphSchemaObj;
        // fieldObj: {
        //     "kind": "FieldDefinition",
        //     "name": {
        //         "kind": "Name",
        //         "value": "data" // 只有一個叫'data'的欄位
        //     },
        //     "arguments": [ ],
        //     "type": {
        //         "kind": "ListType", // 代表是陣列
        //         "type": {
        //             "kind": "NamedType", // 型態名稱
        //             "name": {
        //                 "kind": "Name",
        //                 "value": "Permission" // 代表參照 'Permission' 的Type
        //             }
        //         }
        //     },
        //     "directives": [
        //     ]
        // }
        this.fieldName = fieldObj.name.value; // 欄位名稱

        this.fieldKind = fieldObj.type.kind;

        if (fieldObj.defaultValue) {
            this.defaultValueKind = fieldObj.defaultValue.kind;
            // 'IntValue', 'StringValue'

            this.defaultValue = this.convertDefaultValue(fieldObj.defaultValue.value);
        }

        const filedTypeObj = fieldObj.type;

        // fieldType------------------------------------------------------------

        if (this.fieldKind === Kind.NamedType) { // 一般數值欄位: 直接載入fieldName
            this.fieldType = this.getFieldNameByNamedTypeObj(filedTypeObj);
        } else if (this.fieldKind === Kind.NonNullType // 必填欄位
            || this.fieldKind === Kind.ListType) { // 陣列
            const namedTypeObj = this.buildWrapedFieldTypeObj(filedTypeObj);
            this.fieldType = this.getFieldNameByNamedTypeObj(namedTypeObj);
        } else {
            console.error(`fieldName Kind not support`, this.fieldKind);
        }

        // 已取得this.fieldType
        // 檢查是否為基本型態
        this.isBasicType = NamedType.checkBasicType(this.fieldType);
        // false 代表是參照其他的結構
    }

    convertDefaultValue(defaultValueRaw) {
        if (this.defaultValueKind === 'StringValue') {
            return defaultValueRaw; // 字串不必轉換
        } else if (this.defaultValueKind === 'IntValue') {
            return Number(defaultValueRaw);
        } else if (this.defaultValueKind === 'FloatValue') {
            return parseFloat(defaultValueRaw);
        } else if (this.defaultValueKind === 'BooleanValue') {
            return defaultValueRaw; // 已經轉換好了
        } else {
            console.error(`convertDefaultValue not support ${this.defaultValueKind}`);
            return null;
        }
    }

    getFieldNameByNamedTypeObj(namedTypeObj) {
        /* namedTypeObj: {
            "kind": "NamedType",
            "name": {
                "kind": "Name",
                "value": "Permission",
            }
        } */
        return namedTypeObj.name.value;
    }

    openSelfAttribute(kind) {
        if (kind === Kind.NonNullType) {
            this.isNonNull = true;
        } else if (kind === Kind.ListType) {
            this.isListType = true;
        }
    }

    buildWrapedFieldTypeObj(filedTypeObj) {
        let obj = filedTypeObj;

        let objLayer = 1;

        const wrapKindList = [];

        const LAYER_LIMIT = 5; // 層數上限

        const validKindMap = {
            [Kind.NonNullType]: true,
            [Kind.ListType]: true,
        }

        while (obj.kind !== Kind.NamedType && objLayer <= LAYER_LIMIT) { // 最多只到5層
            if (!validKindMap[obj.kind]) {
                console.error(`buildWrapedFieldTypeObj: wrap kind \`${obj.kind}\`not support`);
                break;
            }

            // 自動載入屬性
            this.openSelfAttribute(obj.kind);

            wrapKindList.push(obj.kind);

            obj = obj.type; // 開啟下一層
            objLayer += 1;

            if (objLayer > LAYER_LIMIT) {
                console.error(`buildWrapedFieldTypeObj: layer is over LAYER_LIMIT`);
            }
        }

        // 紀錄每層的kind
        this.wrapKindList = wrapKindList;
        return obj;

        // // 第二層的kind判斷失敗
        // if (filedTypeObj.type.kind !== Kind.NamedType) {
        //     this.hasError = true;
        //     console.error(`NonNullType error: filedTypeObj kind not support`, filedTypeObj.type.kind);
        //     return;
        // }
        // // 代表是一般命名欄位
        // return filedTypeObj.type.name.value;

        // gql: `
        // id: Int!
        // ` ====>
        //  { // <filedTypeObj> 疊二層
        //     "kind": "NonNullType", // 代表是必填欄位
        //     "type": { // <namedTypeObj>
        //         "kind": "NamedType", // 型態名稱
        //         "name": {
        //             "kind": "Name",
        //             "value": "Int" // 名稱為Int (Int Boolean String ..<Custom>)
        //         }
        //     }
        // }
        // -------------------------------------------
        // gql: `
        // data: [Permission]!
        // ` ====>
        // { // <filedTypeObj> 疊三層
        //     "kind": "NonNullType", // <-(1)
        //     "type": {
        //         "kind": "ListType", // <-(2)
        //         "type": { // <namedTypeObj>
        //             "kind": "NamedType",
        //             "name": {
        //                 "kind": "Name",
        //                 "value": "Permission",
        //             }
        //         }
        //     }
        // }
    }

    // 這個之後刪
    // validateField(value, graphTypeDefObj) {
    //     // graphTypeDefObj: <GraphTypeDef>
    //     const vm = this;

    //     console.log('validateField', this.wrapKindList, this.fieldType);
    //     console.log('validateField 2', graphTypeDefObj);

    //     let isValid = true;
    //     // this.wrapKindList: ['NonNullType', 'ListType']
    //     // this.fieldType: 'Permission'
    //     this.wrapKindList.forEach((kind) => {
    //         const preValid = this.runPreValidate(kind, value);
    //         if (!preValid) {
    //             isValid = false;
    //         }
    //     });

    //     if (!isValid) {
    //         console.error(`prevalidate fail`);
    //         return;
    //     }

    //     this.runValidateTypeDef(value, (dataObj) => {
    //         const res = vm.validateByTypeDef(dataObj, graphTypeDefObj);
    //         if (!res) {
    //             isValid = false;
    //         }
    //     });

    //     return isValid;
    // }

    // validateByTypeDef(dataObj, graphTypeDefObj) {
    //     if (!graphTypeDefObj) {
    //         console.error(`validateByTypeDef: graphTypeDefObj not exist`);
    //         return;
    //     }
    //     return graphTypeDefObj.validateDataObj(dataObj);
    // }

    // 自動判斷是否為陣列
    runValidateTypeDef(value, handleFunc) {
        if (this.isListType) {
            // 代表是陣列
            value.forEach((element, index) => {
                handleFunc(element, index);
            });
        } else {
            handleFunc(value);
        }
    }

    runPreValidate(kind, value) {
        if (kind === Kind.NonNullType) {
            const notNull = value != null;
            console.error(`runPreValidate: value is null`);
            return notNull;
        } else if (kind === Kind.ListType) {
            const isArray = Array.isArray(value);
            if (!isArray) {
                console.error(`runPreValidate not is array`);
            }
            return isArray;
        }
    }

    genCustomTypeObj() {
        // 去上層撈隔壁的typeDef
        const typeDefObj = this.graphSchemaObj.findTypeDef(this.fieldType);
        if (!typeDefObj) {
            console.error(`genCustomTypeObj: typeDefObj not exist`);
            return undefined;
        }
        const swagObj = typeDefObj.getSwagObj();
        if (!swagObj) {
            console.error(`genCustomTypeObj: ${this.fieldType} swagObj get fail`)
            return undefined;
        }
        return swagObj;
    }

    genSwaggerObj() {
        if (!this.isBasicType) {
            console.error(`not support custom Obj`, this.fieldType);
            return undefined;
            // return this.genCustomTypeObj();
        }

        // boolean, string, integer, float(?)

        const typeConvertMap = {
            [NamedType.Int]: 'integer',
            [NamedType.Float]: 'float', // (?)
            [NamedType.String]: 'string',
            [NamedType.Boolean]: 'boolean',
        }

        const type = typeConvertMap[this.fieldType];
        if (!type) {
            console.error(`gql type \`${this.fieldType}\` not support`);
            return undefined;
        }
        const swagPropertyObj = {
            "type": type,
            "description": "" // 欄位描述
        };

        if (this.defaultValue) { // 代表有預設值
            swagPropertyObj['default'] = this.defaultValue;
        }

        return swagPropertyObj;

        // return {
        //     "type": "boolean",
        //     "default": true,
        //     "description": "帳號是否已激活"
        // }
    }
}

module.exports = class GraphTypeDef {
    // gValidateObj = null; // <GraphValidate>(上層)
    graphSchemaObj = null; // <GraphSchema>(上層)

    fieldList = []; // [<GraphField>] (下層)

    name = '';

    // layer = 1; // 目前還沒用到

    // autoBuildSwagObj()----------------------------------------------------

    swagObj = null;
    leakTypeDefList = [];

    getSwagObj() { // 提供給<GraphField>去抓
        return this.swagObj;
    }

    checkPropertiesDefinition(typeDefMap) {
        // let isReadyBuild = true;
        let leakTypeDefList = [];
        this.fieldList.forEach((graphFieldObj) => {
            if (graphFieldObj.isBasicType) {
                return; // 基礎型別不必檢查
            }

            if (!typeDefMap[graphFieldObj.fieldType]) {
                // isReadyBuild = false; // 代表這個typeDef還沒build出來
                leakTypeDefList.push(graphFieldObj.fieldType);
            }
        });

        this.leakTypeDefList = leakTypeDefList;
        return this.leakTypeDefList;
    }

    buildSwagObj() {
        const swagSchemaObj = {
            "type": "object",
            "properties": {}
        }

        const requiredKeyList = [];
        this.fieldList.forEach((graphFieldObj) => {

            if (graphFieldObj.isNonNull) { // 代表是必填欄位
                requiredKeyList.push(graphFieldObj.fieldName);
            }

            let swagFieldObj;

            if (graphFieldObj.isListType) {
                if (!graphFieldObj.isBasicType) { // 代表是客製化TypeDef
                    swagFieldObj = graphFieldObj.genCustomTypeObj();
                } else {
                    swagFieldObj = graphFieldObj.genSwaggerObj();
                }
                // 陣列需要多包一層
                swagFieldObj = {
                    "type": "array",
                    "items": swagFieldObj,
                    // "description": "帳號列表"
                };
            } else if (!graphFieldObj.isBasicType) { // 代表是客製化TypeDef
                swagFieldObj = graphFieldObj.genCustomTypeObj();
            } else {
                swagFieldObj = graphFieldObj.genSwaggerObj();
            }


            swagSchemaObj.properties[graphFieldObj.fieldName] = swagFieldObj;
        });

        swagSchemaObj['required'] = requiredKeyList;

        this.swagObj = swagSchemaObj; // 存起來，提供<GraphField>來抓

        return swagSchemaObj;
    }

    constructor(typeDefObj, graphSchemaObj) {
        // this.gValidateObj = gValidateObj;

        if (graphSchemaObj.constructor.name !== 'GraphSchema') {
            console.error('graphSchemaObj is not GraphSchema');
            return;
        }
        console.log('graphSchemaObj.constructor.name', graphSchemaObj.constructor.name);
        this.graphSchemaObj = graphSchemaObj;

        /* {
            "kind": "ObjectTypeDefinition", // 物件型態
            "name": {
                "kind": "Name",
                "value": "Permission" // 名稱
            },
            "interfaces": [],
            "directives": [],
            "fields": [{ // <fieldObj>
                "kind": "FieldDefinition",
                "name": {
                    "kind": "Name",
                    "value": "id"
                },
                "arguments": [ ],
                "type": { // <filedTypeObj>
                    "kind": "NonNullType", // 代表是必填欄位
                    "type": {
                        "kind": "NamedType", // 型態名稱
                        "name": {
                            "kind": "Name",
                            "value": "Int" // 名稱為Int (Int Boolean String ..<Custom>)
                        }
                    }
                },
                "directives": [ ]
            },
            {
                "kind": "FieldDefinition",
                "name": {
                    "kind": "Name",
                    "value": "roleName"
                },
                "arguments": [

                ],
                "type": { // <filedTypeObj>
                    "kind": "NamedType", // 一般欄位(非必填)
                    "name": {
                        "kind": "Name",
                        "value": "String"
                    }
                },
                "directives": [

                ]
            }] // 欄位
        }
        ---------------------------------------
        {
            "kind": "ObjectTypeDefinition", // 物件型態
            "name": {
                "kind": "Name",
                "value": "SYSTEM_PERMISSION_LIST" // 名稱
            },
            "interfaces": [ ],
            "directives": [ ],
            "fields": [
                {
                    "kind": "FieldDefinition",
                    "name": {
                        "kind": "Name",
                        "value": "data" // 只有一個叫'data'的欄位
                    },
                    "arguments": [ ],
                    "type": {
                        "kind": "ListType", // 代表是陣列
                        "type": {
                            "kind": "NamedType", // 型態名稱
                            "name": {
                                "kind": "Name",
                                "value": "Permission" // 代表參照 'Permission' 的Type
                            }
                        }
                    },
                    "directives": [

                    ]
                }
            ]
        } */
        this.name = typeDefObj.name.value;
        this.typeDefObj = typeDefObj;

        this.loadFields(Kind.InputValueDefinition); // 載入該物件所有欄位 // Kind.FieldDefinition
    }

    loadFields(kind) {
        const vm = this;
        const newFieldList = [];
        this.typeDefObj.fields.filter((fieldObj) => fieldObj.kind === kind)
            .forEach((fieldObj) => {
                if (fieldObj.type.kind === Kind.NonNullType // 必填欄位
                    || fieldObj.type.kind === Kind.NamedType // 非必填
                    || fieldObj.type.kind === Kind.ListType) { // 非必填陣列
                    // 直接丟進GraphField處理
                    const gFieldObj = new GraphField(fieldObj, vm.graphSchemaObj);

                    if (gFieldObj.hasError) {
                        console.error(`fObj has error`);
                    } else if (gFieldObj.isBasicType) { // 基本型態
                        newFieldList.push(gFieldObj);
                    } else { // 參照型態
                        newFieldList.push(gFieldObj);
                    }
                } else {
                    console.error(`loadFields: fieldObj.type.kind \`${fieldObj.type.kind}\` not support`);
                }
            });

        // newFieldList.forEach((graphFieldObj) => {
        //     console.log(`gql field => ${graphFieldObj.fieldName}: ${graphFieldObj.fieldType}`);
        // })
        this.fieldList = newFieldList;
    }

    // validateCustomType(gFieldObj, value) {
    //     // gFieldObj: <GraphField>

    //     // console.log('validateCustomType', gFieldObj, value)

    //     const fieldType = gFieldObj.fieldType;
    //     // 從GraphValidate取得該CustomType的typeDef
    //     const graphTypeDefObj = this.gValidateObj.findTypeDef(fieldType);
    //     // graphTypeDefObj: <GraphTypeDef>
    //     if (!graphTypeDefObj) {
    //         // 代表忘了定義該TypeDef
    //         console.error(`validateCustomType: graphTypeDefObj not found`);
    //         return;
    //     }
    //     // console.log(`validateCustomType graphTypeDefObj`, graphTypeDefObj)

    //     // 跳去隔壁的TypeDef做驗證
    //     return graphTypeDefObj.validateDataObj(value);
    // }

    // 驗證物件的統一入口
    validateDataObj(dataObj) {
        // console.log(`validateEntry: `, dataObj);
        const vm = this;
        let isValid = true;

        const receiveRes = (res) => {
            if (!res) {
                // console.log(`receiveRes`, res);
                // console.error(`receiveRes`, res);
                isValid = false;
            }
            return res;
        };

        const checkValueNull = function (gFieldObj, value, next) {
            const isNull = ValueValidate.checkValueNull(value);
            if (isNull) { // 判定該欄位數值為null
                // 代表出現了null數值，檢查是否可容許null
                if (gFieldObj.isNonNull) {
                    // 代表不能容許null
                    console.error(`NonNull Error:`, value, `=>${gFieldObj.fieldName}: ${gFieldObj.fieldType}`);
                    next(false);
                    return isNull;
                }
                // 代表容許是null，直接略過後面的數值檢查
                next(true);
                return isNull; // (true不會作用)
            }
            return isNull;
        }

        const validateObj = function (gFieldObj, value, next) { // , i next: receiveRes
            // const fieldName = gFieldObj.fieldName;
            const fieldType = gFieldObj.fieldType;
            const isBasicType = gFieldObj.isBasicType;

            // Debug用
            // console.log(`<${vm.name}${i !== undefined ? `[${i}]` : ''}>fieldValidate:`, value, `[${fieldName}]=> ${fieldType}`, isValid);

            if (!isBasicType) { // 原本的validateCustomType
                // 找出隔壁的TypeDefObj: <GraphTypeDef>

                // 舊版: vm.graphSchemaObj <-- vm.gValidateObj
                const graphTypeDefObj = vm.graphSchemaObj.findTypeDef(fieldType);
                if (!graphTypeDefObj) {
                    // 代表忘了定義該TypeDef
                    console.error(`validateCustomType: graphTypeDefObj not found`);
                    return;
                }
                // 跳去隔壁的TypeDef做驗證
                return next(graphTypeDefObj.validateDataObj(value));
                // return next(vm.validateCustomType(gFieldObj, value));
            }

            const isNull = checkValueNull(gFieldObj, value, next);
            if (isNull) { // 代表是null，就不繼續往下判斷
                return;
            }
            // if (ValueValidate.checkValueNull(value)) { // 判定該欄位數值為null
            //     console.log(`isNull:`, value, `=>${gFieldObj.fieldName}: ${fieldType}`);
            //     // 代表出現了null數值，檢查是否可容許null
            //     if (gFieldObj.isNonNull) {
            //         // 代表不能容許null
            //         console.error(`NonNull Error:`, value, `=>${gFieldObj.fieldName}: ${fieldType}`);
            //         return next(false);
            //     }
            //     // 代表容許是null，直接略過後面的數值檢查
            //     return next(true); // (true不會作用)
            // }

            // 代表是基礎型態數值
            const res = ValueValidate.validateValue(fieldType, value);
            if (!res) {
                console.error(`fieldError:`, value, `=>${gFieldObj.fieldName}: ${fieldType}`, res);
            }
            return next(res);
        }

        this.fieldList.forEach((gFieldObj) => {
            // gFieldObj: <GraphField>
            const fieldName = gFieldObj.fieldName;
            const value = dataObj[fieldName];

            if (gFieldObj.isListType) {
                // 檢查該欄位是否為null
                // const validRes = receiveRes(checkValueNull(gFieldObj, value));
                // if (!validRes) {
                //     console.log(`field ${fieldName} is null`);
                //     return;
                // }
                const isNull = checkValueNull(gFieldObj, value, receiveRes);
                if (isNull) {
                    console.log(`field ${fieldName} is null`);
                    return;
                }
                // 代表該欄位為陣列
                gFieldObj.runValidateTypeDef(value, (obj, i) => {
                    // 多疊一層
                    validateObj(gFieldObj, obj, receiveRes, i);
                });
                return;
            }

            // 未完成: 還有可能是物件
            // 未完成: 陣列元素有可能是一般數值，非物件

            // 該欄位為一般數值
            validateObj(gFieldObj, value, receiveRes);
        });

        return isValid;
    }
}