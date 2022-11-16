// require('log-timestamp');
var express = require('express');
var cors = require('cors');
// var path = require('path');
// var fs = require('fs');

// var cookieParser = require('cookie-parser'); // 暫時沒用到

// var multer = require('multer');
// postFormData
// var upload = multer();
// 檔案上傳
// const uploadFile = multer({ dest: 'upload_temp/' }); // 設定上傳暫存目錄

// const SenderHelper = require('./senderHelper.js');
// const ApiTemplateHelper = require('./apiTemplateHelper.js');

// const swaggerUi = require('swagger-ui-express');

// ApiTemplateHelper.initialize();


// lodding module------------------------------------------------

const config = require('./config.js');
const apiPrehandler = require('./apiPrehandler.js');
const apiMockserver = require('./apiMockserver.js');


// server setting---------------------------------------------

const corsOptions = {
    // origin: "*", // 全開
    origin: [
        'http://localhost:8080', // Vue
        'http://localhost:3000', // React
        'http://localhost:9001', // Swagger
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // allowedHeaders: ['Content-Type', 'Authorization'],
    //   "preflightContinue": false,
    //   "optionsSuccessStatus": 204
};


// server build---------------------------------------------

var app = express();

app.use(cors(corsOptions));


// 使用express內建的bodyParser
app.use(express.json());

// // -----------------------
// app.use(cookieParser());

// 預先設定好各類API的prehandle
apiPrehandler.initApiPrehandler(config.apiFolder);

apiMockserver.run(app, config.apiFolder);



// Swagger-----------------------------------------------------------
/*

// const swaggerDocument = require('./swagger/__createTemplate.json');
const swaggerDocument = require('./swagger/qore-plus-api.json');
const ServerManage = require('./serverManage.js');

app.use(cors(corsOptions));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// ==> 'http://localhost:9000/api-docs/'


let server = app.listen(9001, function () {
    console.log(`Swagger Server has on 'http://localhost:9001/api-docs/'`);
});
*/

// swaggerServer.registApp(app);

// swaggerServer.createSwaggerServer('qore-plus-api');

// const swagServerObj = new SwaggerServer(app);
// swaggerServer.initApiDocSwaggerServer();


const swaggerServer = require('./swaggerServer.js');
swaggerServer.initSwaggerServer(app);



// public json--------------------------------------------------

const path = require('path');
const SwaggerManage = require('./swaggerManage/swaggerManage.js');

//setting middleware
// app.use('/apiDoc', express.static(path.join(__dirname, 'public/apiDoc'))); //Serves resources from public folder
app.use('/apiDoc', express.static(SwaggerManage.getFilePath())); //Serves resources from public folder

app.listen(5050);

console.log(`apiDoc File server on http://localhost:5050/apiDoc`);