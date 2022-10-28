
const friendRes = {
    data: {
        firstFriend: {
            commonFriend: {
                name: 'Jack',
            }
        }
    }
};
// 簡易的swagger測試用API
const apiData = {
    apiType: 'post',
    reactType: 'json', // raw
    apiRoute: '/api/friend', // 指定API路由
    preRequestScript: async function () {

    },
    handle: async function (req, res) {

        res.react(friendRes);
    }
}
module.exports = apiData;