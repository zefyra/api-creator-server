
const friendRes = {
    data: {
        firstFriend: {
            commonFriend: {
                name: 'Jack',
            }
        }
    }
};

const gql = require('graphql-tag');

const SYSTEM_FRIEND_LIST = require('../graphQuery/schema/SYSTEM_FRIEND_LIST');

const GraphType = require('../graphQuery/graphType');

const GraphValidate = require('../graphQuery/graphValidate.js');
const GraphSchema = require('../graphQuery/graphSchema');

// 從schema生成一個GraphValidate物件
const apiData = {
    apiType: 'post',
    reactType: 'json', // raw
    apiRoute: '/api/gqlSchema', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {

        // const validateRes = await new GraphValidate(graphKey, graphConfig, vm.dataMap[graphKey]).validateAsync();

        const graphKey = GraphType.SYSTEM_FRIEND_LIST;

        const graphConfig = { // [<rootType>]: <graphConfig>
            schema: SYSTEM_FRIEND_LIST, // <typeDef>
            fetch: function (val) {
                return val;
            }, // testFetch.friend
        };

        // 執行fetch
        // this.dataMap = this.fetchObj.fetchDataMap(apiRes);
        const data = {}; // vm.dataMap[graphKey]


        // const gqlObj = gql`
        //     type Friend {
        //         id: Int!
        //         enabled: Boolean!
        //         roleName: String
        //         resourceName: String
        //         parentResource: String
        //     }
        //     type SYSTEM_FRIEND_LIST {
        //         data: [Permission]!
        //         code: String
        //     }
        // `;
        // const gqlObj = gql`
        //     ${graphConfig.schema}
        // `
        // console.log('gqlObj', gqlObj)

        // 生成GraphValidate物件

        // const gValidateObj = new GraphValidate(graphKey, graphConfig, data);
        // console.log('gValidateObj', gValidateObj)



        // const gSchema = new GraphSchema(graphKey, SYSTEM_FRIEND_LIST);
        const gSchema = new GraphSchema(GraphType.SYSTEM_FRIEND_LIST);
        console.log('gSchema', gSchema);

        res.react(friendRes); // friendRes
    }
}
module.exports = apiData;