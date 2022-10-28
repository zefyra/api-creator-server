
const jwt = require('jsonwebtoken');
const config = require('./config.js');
const path = require('path');

var Validator = require('jsonschema').Validator;
var v = new Validator();

/*
// Address, to be embedded on Person
var addressSchema = {
    "id": "/SimpleAddress",
    "type": "object",
    "properties": {
        "lines": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "zip": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" }
    },
    "required": ["country"]
};

v.addSchema(addressSchema, '/SimpleAddress');
*/


const apiPrehandler = {
    apiPrehandleMap: {
        // '/api': [this.checkNatsConnection] -->已改到config去設定
    },
    initApiPrehandler: function (apiFolderList) {
        /*     apiFolderList: [{
            apiPrefix: '/api',
            path: './acceptApi',
            prehandleList: ['apiValidator']
        }], */
        const vm = this;

        apiFolderList.forEach((eachApiFolder) => {
            if (eachApiFolder.prehandleList) {
                // 代表有要設定該資料夾的prehandle
                let newPrehandleList = [];

                eachApiFolder.prehandleList.forEach((prehandleFuncKey) => {
                    if (typeof vm[prehandleFuncKey] === 'function') {
                        // 代表該函式存在
                        newPrehandleList.push(vm[prehandleFuncKey]);
                    }
                });

                const key = vm.getApiFolderKey(eachApiFolder);
                vm.apiPrehandleMap[key] = newPrehandleList;
                // vm.apiPrehandleMap[eachApiFolder.apiPrefix] = newPrehandleList;
            }
        });
    },
    getApiFolderKey: function (apiFolderConfig) {
        const apiPrefix = apiFolderConfig.apiPrefix;
        const port = apiFolderConfig.port;

        const key = `${port}${apiPrefix}`;
        return key;
    },
    getPrehandleList: function (apiFolderConfig) {
        const key = this.getApiFolderKey(apiFolderConfig);
        // 舊版lamy-server的設定
        // if (apiPrefix === '/admin') {
        //     return [this.apiValidator, this.tokenValidator, this.vtuberSupportValidator];
        // } else if (apiPrefix === '/api') {
        //     return [this.apiValidator, this.vtuberSupportValidator];
        // }

        return this.apiPrehandleMap[key] || [];
        /*
        if (apiPrefix === '/api') { // nodejs-nats
            return [this.apiValidator];
        } else if (apiPrefix === '/testApi') {
            return [this.apiValidator];
        }

        console.error(`${apiPrefix} have no any prehandle`);
        return null;
         */
    },
    getPrehandleListByMap: function (prehandleMap) {
        const vm = this;

        let i = 0;
        let prehandleList = [];
        while (prehandleMap[i]) {
            const prehandleFuncKey = prehandleMap[i];

            if (vm[prehandleFuncKey]) {
                prehandleList.push(vm[prehandleFuncKey]);
            }
            i += 1;
        }
        return prehandleList;
    },

    // jsonschema
    // https://www.npmjs.com/package/jsonschema

    // 檢驗API格式
    apiValidator: async function (req, res) {
        if (!this.paramSchema) {
            return Promise.resolve();
        }
        /*
        // Person
        var schema = {
            "id": "/SimplePerson",
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "address": { "$ref": "/SimpleAddress" },
                "votes": { "type": "integer", "minimum": 1 }
            }
        };

        var p = {
            "name": "Barack Obama",
            "address": {
                "lines": ["1600 Pennsylvania Avenue Northwest"],
                "zip": "DC 20500",
                "city": "Washington",
                "country": "USA"
            },
            "votes": "lots"
        };
        */

        // console.log('apiValidator');

        // ps. this會指到該API的物件
        const validateResult = v.validate(req.body, this.paramSchema);
        // console.log(validateResult);

        if (validateResult.errors.length !== 0) {
            /* validateResult.errors[0]: {
                argument:'name'
                instance:{userId: 'zefyazure', iconSrc: 'https://pbs.twimg.com/profile_images/1376473223882174469/NY_IzXD5_400x400.jpg', userName: 'あ里エナイ☩開発者【雪民】', time: '2021.04.13', content: 'ここここここここここここここここここここここここここここここここここここここここここここここここここここここここここ'}
                message:'requires property "name"'
                name:'required'
                path:(0) []
                property:'instance'
                schema:'/SimplePerson'
                stack:'instance requires property "name"'
            }*/

            console.error(validateResult.errors);
            return Promise.reject(validateResult.errors[0].message);
        }

        return;
    },

    // jwt.io
    // https://jwt.io/

    // [筆記] 透過 JWT 實作驗證機制
    // https://medium.com/%E9%BA%A5%E5%85%8B%E7%9A%84%E5%8D%8A%E8%B7%AF%E5%87%BA%E5%AE%B6%E7%AD%86%E8%A8%98/%E7%AD%86%E8%A8%98-%E9%80%8F%E9%81%8E-jwt-%E5%AF%A6%E4%BD%9C%E9%A9%97%E8%AD%89%E6%A9%9F%E5%88%B6-2e64d72594f8

    // 檢驗header內的authToken
    tokenValidator: async function (req, res) {
        // 設定密鑰
        const SECRET = config.secret;
        // // 建立 Token
        // const token = jwt.sign({ adminId: 'zefyazure' }, SECRET, { expiresIn: '1m' })
        // console.log(`1m token=${token}`); // '1m' = 1 分鐘

        // expiresIn: '1 day', '1 year'

        // console.log('Cookies: ', req.cookies)
        // ps.目前還抓不到，可能需要由server來設定cookie的Domain

        const authToken = req.headers.authtoken;
        if (!authToken) {
            return Promise.reject('authTokenNotExist');
        }

        const decoded = jwt.verify(authToken, SECRET)
        // 若token驗證失敗，會直接 throw error
        // ===> error_JsonWebTokenError: invalid token

        // new Date(decoded.exp * 1000).toLocaleString()
        // ===> 2021/5/28 上午12:14:12

        return;
    },
}

module.exports = apiPrehandler;
