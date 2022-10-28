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

const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger/swagger.json');
// const swaggerDocument = require('./swagger/dataCollection.json');

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
        'http://localhost:3000' // React
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