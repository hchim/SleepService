/**
 * This file defines the rest style error handler middleware.
 */
var express = require('express');
var router = express.Router();
var env = process.env.NODE_ENV || 'development';

//catch 404 and forward to error handler
router.use(function(req, res, next) {
  var err = new Error('404 Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stack trace
if (env === 'development') {
  router.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stack traces leaked to user
router.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(process.env.NODE_ENV);
  res.json({
    message: err.message
  });
});

module.exports = router;

