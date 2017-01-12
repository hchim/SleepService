var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var conf = require("./config");

//user defined middleware
var errorHandler = require('./middlewares/rest_error_handler');
//routes
var sleepRecords = require('./routes/sleeprecords');
var babyInfos = require('./routes/babyinfo');
var index = require('./routes/index');

var app = express();

if (conf.get("env") === "production") {
    var logDirectory = __dirname + '/log';
    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    // create a rotating write stream
    var accessLogStream = FileStreamRotator.getStream({
        date_format: conf.get('log.dateformat'),
        filename: logDirectory + '/access-%DATE%.log',
        frequency: conf.get("log.frequency"),
        verbose: false
    });
    app.use(morgan('combined', {stream: accessLogStream}));
} else {
    app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// setup routes
app.use('/', index);
app.use('/sleeprecs', sleepRecords);
app.use('/babyinfos', babyInfos);

app.use(errorHandler);

module.exports = app;
