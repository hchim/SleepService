var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var conf = require("./config");
var middlewares = require('service-middlewares')(conf)
var metric = require('metricsclient')(conf)
var utils = require('servicecommonutils')

//routes
var sleepRecords = require('./routes/sleeprecords');
var babyInfos = require('./routes/babyinfo');
var trainingPlan = require('./routes/trainingplan')
var index = require('./routes/index');
var trainingRecords = require('./routes/trainingrecord')

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
//api usage metric
if (conf.get("env") !== 'test') {
    app.use(function (req, res, next) {
        metric.increaseCounter('SleepService:Usage:' + req.method + ':' + req.url, function (err, jsonObj) {
            if (err != null)
                console.log(err)
            next()
        })
    })
}

app.use('/', index)
//request signature checkup
if (conf.get("env") !== 'test') {
    app.use(middlewares.signature_middleware)
}

// setup routes
app.use('/sleeprecs', middlewares.auth_middleware, sleepRecords);
app.use('/babyinfos', middlewares.auth_middleware, babyInfos);
app.use('/plan', middlewares.auth_middleware, trainingPlan);
app.use('/trainrecs', middlewares.auth_middleware, trainingRecords);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stack trace
if (conf.get("env") === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json(utils.encodeResponseBody(req, {
            message: err.message,
            error: err,
            errorCode: 'INTERNAL_FAILURE'
        }));
    });
}

// production error handler
// no stack traces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    metric.errorMetric('SleepService:Error:' + req.method + ':' + req.url, err, function (error, jsonObj) {
        if (error != null)
            return res.json(utils.encodeResponseBody(req, {
                message: 'Failed to add metric. \n' + err.message,
                errorCode: 'INTERNAL_FAILURE'
            }));
        res.json(utils.encodeResponseBody(req, {
            message: err.message,
            errorCode: 'INTERNAL_FAILURE'
        }));
    })
});

module.exports = app;
