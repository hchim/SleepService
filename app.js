var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var conf = require("./config");
var middlewares = require('service-middlewares')(conf)

//routes
var sleepRecords = require('./routes/sleeprecords');
var babyInfos = require('./routes/babyinfo');
var trainingPlan = require('./routes/trainingplan')
var index = require('./routes/index');
var trainingRecords = require('./routes/trainingrecord')

var app = express();
var logDirectory = __dirname + '/log';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.use(middlewares.error_404_middleware);
if (conf.get("env") !== 'production') {
    app.use(middlewares.error_500_middleware_dev);
} else {
    app.use(middlewares.error_500_middleware_prod)
}

module.exports = app;
