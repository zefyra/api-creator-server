
const serverMap = {};


module.exports = class ServerManage {
    static registServer(serverName, server) {
        serverMap[serverName] = server;
    }
    static closeServer(serverName) { // <fileName>
        if (!serverMap[serverName]) {
            console.error(`serverName not exist`);
            return Promise.reject(`serverName not exist`);
        }

        return new Promise((resolve) => {
            serverMap[serverName].close((er) => {
                resolve();
            });
        })
    }
}