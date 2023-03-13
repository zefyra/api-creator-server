

class FieldFetcher {
    constructor(fieldObj) {
        this.fieldObj = fieldObj;
    }
    removeAttribute(name) {
        let fieldObj = this.fieldObj;

        if (fieldObj.type === 'array') {
            fieldObj = fieldObj.items; // array的型態，要直接拿內部的items欄位
        }
        if (fieldObj.type !== 'object') { // 只有object型態可以再往內部加欄位
            throw `removeAttribute: fieldObj type is not object`;
        }
        if (!fieldObj.properties) {
            fieldObj.properties = {};
        }

        delete fieldObj.properties[name];

        if (!fieldObj.required) {
            fieldObj.required = [];
        }

        let indexToRemove = fieldObj.required.indexOf(name);
        if (indexToRemove >= 0) {
            fieldObj.required.splice(indexToRemove, 1);
        }
    }
    addAttributeAfter(cursorName, name, insertFieldObj, required = false) {
        // cursorName: 要插入的位置的欄位名稱
        const fieldObj = this.fieldObj;
        if (fieldObj.type !== 'object') { // 只有object型態可以再往內部加欄位
            throw `addAttributeAfter: fieldObj type is not object`;
        }

        const oldPropertiesObj = fieldObj.properties;

        fieldObj.properties = {}; // 塞一個新的物件進度

        const insertField = function () {
            fieldObj.properties[name] = insertFieldObj;
        }

        for (let prop in oldPropertiesObj) {
            fieldObj.properties[prop] = oldPropertiesObj[prop];

            if (prop === cursorName) { // 找到了
                insertField();
            }
        }
        if (!fieldObj.properties[name]) { // 代表從頭到尾都沒找到
            insertField(); // 直接插入
        }

        if (required) {
            if (!fieldObj.required) {
                fieldObj.required = [];
            }
            fieldObj.required.push(name);
        }
    }
    addAttribute(name, newFieldObj, required = false) {
        // console.log('fieldObj', this.fieldObj);
        /* fieldObj: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "",
                    "default": 1
                }
            },
            "required": [
                "id"
            ]
        } */

        const fieldObj = this.fieldObj;
        if (fieldObj.type !== 'object') { // 只有object型態可以再往內部加欄位
            throw `fieldObj type is not object`;
        }
        if (!fieldObj.properties) {
            fieldObj.properties = {};
        }
        if (!fieldObj.required) {
            fieldObj.required = [];
        }

        fieldObj.properties[name] = newFieldObj;

        if (required) {
            fieldObj.required.push(name);
        }
    }
}



module.exports = FieldFetcher;