var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var TrainingRecord = require("sleepservicemodels").TrainingRecord(mongoose.connection);
var TrainingPlan = require("sleepservicemodels").TrainingPlan(mongoose.connection);
var utils = require('servicecommonutils')
var conf = require("../config");
var metric = require('metricsclient')(conf)
var winston = utils.getWinston(conf.get('env'))
/**
 * Add a training record.
 */
router.post("/", function(req, res, next) {
    metric.increaseCounter('SleepService:Usage:TrainingRecord:Add', function (err, jsonObj) {
        if (err != null)
            winston.error(err.message, err)
    })
    var id = req.headers['userId'];
    if (!id) {
        return res.json(utils.encodeResponseBody(req, {
            "message": "User id not found.",
            "errorCode": "UNKNOWN_USER"
        }));
    }

    TrainingPlan.findOne({ '_id': req.body.planId, isActive: true}, function (err, plan) {
        if (err) {
            return next(err);
        }

        if (plan == null) {
            res.json(utils.encodeResponseBody(req, {
                message: "Failed to find the sleep training plan with this account.",
                errorCode: "SLEEP_TRAINING_PLAN_NOT_EXISTS",
            }));
        } else {
            var record = new TrainingRecord({
                planId: req.body.planId,
                elapsedTime: req.body.elapsedTime,
                sootheTimes: req.body.sootheTimes,
                criedOutTimes: req.body.criedOutTimes
            });

            record.save(function (err, record) {
                if (err) return next(err);
                return res.json(utils.encodeResponseBody(req, {'_id': record._id}));
            });
        }
    });
});

module.exports = router;