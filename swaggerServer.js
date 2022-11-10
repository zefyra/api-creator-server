const swaggerUi = require('swagger-ui-express');

const config = require('./config');

const ServerManage = require('./serverManage.js');
const requireNoCache = require('./requireNoCache.js');
const SwaggerManage = require('./swaggerManage/swaggerManage.js');

// const hostList = [
//     'http://localhost:9001', // Swagger
//     'http://localhost:9002',
//     'http://localhost:9003',
//     'http://localhost:9004',
//     'http://localhost:9005',
//     'http://localhost:9006',
//     'http://localhost:9007',
//     'http://localhost:9008',
//     'http://localhost:9009',
//     'http://localhost:9010'
// ];

// const hostInfoList = [];
// const startPort = 9001;
// const endPort = 9010;
// const startPort = config.swaggerServer.startPort;
// const endPort = config.swaggerServer.endPort;

// if (config.swaggerServer && startPort && endPort) {
//     for (let port = startPort; port <= endPort; port += 1) {
//         hostInfoList.push({
//             host: `http://localhost:${port}`,
//             port: port,
//         });
//     }
// }
let swagServerObj;

class SwaggerServer {
    app = null;

    apiDocInfoMap = {};

    serverName = '';

    constructor(app) {
        this.app = app;
    }

    getApiDocInfo(fileName) {
        return apiDocInfoMap[fileName];
    }

    saveApiDocInfo(fileName,
        route,
        port,
        hostUrl) {

        this.apiDocInfoMap[fileName] = {
            fileName,
            route,
            port,
            hostUrl,
        };
    }

    createSwaggerServer(fileName, route, port) {
        const app = this.app;
        // route: '/api-docs',
        // fileName: 'qore-plus-api'
        if (!port) {
            return Promise.reject(`createSwaggerServer: no port`);
        }

        if (!route) {
            return Promise.reject(`createSwaggerServer: no route`);
        }

        // let route = `/api-docs/${fileName}`;
        // route: '/api-docs/qore-plus-api'

        let swaggerDocument;
        try {
            // swaggerDocument = requireNoCache(`./swagger/${fileName}.json`); // 避免抓到catche內的舊資料，載入最新的json
            // swaggerDocument = requireNoCache(`./apiDoc/${fileName}.json`); // 避免抓到catche內的舊資料，載入最新的json
            swaggerDocument = requireNoCache(SwaggerManage.getFilePath(fileName));
        } catch (e) {
            console.error(`swaggerDocument require fail`);
            return Promise.reject(`swaggerDocument require fail`);
        }

        app.use(route, swaggerUi.serve, (...args) => swaggerUi.setup(swaggerDocument)(...args));
        // ==> 'http://localhost:9000/api-docs/'


        // https://stackoverflow.com/questions/55273857/swagger-ui-express-multiple-routes-for-different-api-documentation
        // let swaggerDocEdi = require('./edi-openapi.json');
        // let swaggerDocEcom= require('./ecom-openapi.json');
        // let router = express.Router();

        // router.use('/api/edi', swagger.serve, (req, res) => {
        //     let html = swagger.generateHTML(swaggerDocEdi);
        //     res.send(html);
        // });

        // router.use('/api/ecom', swagger.serve, (req, res) => {
        //     let html = swagger.generateHTML(swaggerDocEcom);
        //     res.send(html);
        //  });

    }

    async initApiDocSwaggerServer() {
        const vm = this;
        const app = this.app;

        let isErr;
        const apiDocList = await SwaggerManage.getApiDocList().catch((err) => {
            console.error(err);
            isErr = isErr;
        });
        if (isErr) return;

        /* apiDocList = [{
            fileName: 'api-creator',
            path: 'http://localhost:5050/apiDoc/api-creator.json',
        }, {
            fileName: 'qore-plus-api',
            path: 'http://localhost:5050/apiDoc/qore-plus-api.json'
        }]; */

        const swaggerPort = 9001; // 固定只用一個port

        for (let i = 0; i < apiDocList.length; i += 1) {
            const apiDoc = apiDocList[i];

            const fileName = apiDoc.fileName;
            const route = `/api-docs/${fileName}`;

            await this.createSwaggerServer(fileName, route, swaggerPort);

            const hostUrl = `http://localhost:${swaggerPort}${route}`;

            console.log(`swagger server has on \'${hostUrl}\'`);

            // apiDocInfoMap[fileName] = {
            //     fileName,
            //     route,
            //     port: swaggerPort,
            //     hostUrl,
            // };

            vm.saveApiDocInfo(
                fileName,
                route,
                swaggerPort,
                hostUrl,
            );
        }
        let server = app.listen(swaggerPort, function () {
            console.log(`swagger server listen on port ${swaggerPort}`);
        });

        this.serverName = 'swagger-api-doc';
        ServerManage.registServer(this.serverName, server);
    }
}


module.exports = {
    initSwaggerServer(app) {
        swagServerObj = new SwaggerServer(app);
        swagServerObj.initApiDocSwaggerServer();
    },
    getSwaggerServer() {
        return swagServerObj;
    }
}