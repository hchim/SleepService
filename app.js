var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//user defined middleware
var errorHandler = require('./middlewares/rest_error_handler');
//routes
var routes = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// setup routes
app.use('/', routes);
app.use('/users', users);

app.use(errorHandler);

module.exports = app;
