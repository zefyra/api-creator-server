const swaggerUi = require('swagger-ui-express');

const ServerManage = require('./serverManage.js');
const requireNoCache = require('./requireNoCache.js');

let app;

module.exports = {
    registApp(appObj) {
        app = appObj;
    },
    createSwaggerServer(fileName) {
        // route: '/api-docs',
        // fileName: 'qore-plus-api'

        // const swaggerDocument = require('./swagger/qore-plus-api.json');

        route = `/api-docs/${fileName}`;
        // route: '/api-docs/qore-plus-api'

        let swaggerDocument;
        try {
            swaggerDocument = requireNoCache(`./swagger/${fileName}.json`); // 避免抓到catche內的舊資料，載入最新的json
        } catch (e) {
            console.error(`swaggerDocument require fail`);
            return Promise.reject(`swaggerDocument require fail`);
        }

        app.use(route, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        // ==> 'http://localhost:9000/api-docs/'

        let server = app.listen(9001, function () {
            console.log(`swagger server has on 'http://localhost:9001${route}'`);
        });

        ServerManage.registServer(fileName, server);

        return Promise.resolve(server);
    }
}