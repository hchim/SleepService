var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var TrainingPlan = require("sleepservicemodels").TrainingPlan(mongoose.connection);
var utils = require('servicecommonutils')
var conf = require("../config");
var metric = require('metricsclient')(conf)
var winston = utils.getWinston(conf.get('env'))

router.get("/", function(req, res, next) {
    metric.increaseCounter('SleepService:Usage:TrainingPlan:Get', function (err, jsonObj) {
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

    TrainingPlan.findOne({ 'userId': id, isActive: true }, function (err, plan) {
        if (err) {
            return next(err);
        }

        if (plan == null) {
            res.json(utils.encodeResponseBody(req, {
                message: "Failed to find the sleep training plan with this account.",
                errorCode: "SLEEP_TRAINING_PLAN_NOT_EXISTS",
            }));
        } else {
            res.json(utils.encodeResponseBody(req, plan));
        }
    });
});

/*
* Add or update sleep training plan.
*/
router.post("/", function(req, res, next) {
    metric.increaseCounter('SleepService:Usage:TrainingPlan:Add', function (err, jsonObj) {
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

    TrainingPlan.findOne({ 'userId': id }, function (err, plan) {
        if (err) {
            return next(err);
        }

        if (plan == null) {
            plan = new TrainingPlan({
                "userId": id,
                "startDate": new Date(req.body.startDate),
                "firstWeekTime":  {
                    sootheTime: req.body['firstWeekTime[sootheTime]'],
                    firstCriedOut: req.body['firstWeekTime[firstCriedOut]'],
                    secondCriedOut: req.body['firstWeekTime[secondCriedOut]'],
                    followingCriedOut: req.body['firstWeekTime[followingCriedOut]'],
                },
                "secondWeekTime": {
                    sootheTime: req.body['secondWeekTime[sootheTime]'],
                    firstCriedOut: req.body['secondWeekTime[firstCriedOut]'],
                    secondCriedOut: req.body['secondWeekTime[secondCriedOut]'],
                    followingCriedOut: req.body['secondWeekTime[followingCriedOut]'],
                },
                "followingWeekTime": {
                    sootheTime: req.body['followingWeekTime[sootheTime]'],
                    firstCriedOut: req.body['followingWeekTime[firstCriedOut]'],
                    secondCriedOut: req.body['followingWeekTime[secondCriedOut]'],
                    followingCriedOut: req.body['followingWeekTime[followingCriedOut]'],
                }
            });

            plan.save(function (err, baby) {
                if (err) {
                    return next(err);
                }
                return res.json(utils.encodeResponseBody(req, {
                    _id: plan._id
                }));
            });
        } else {
            plan.startDate = req.body.startDate;
            plan.firstWeekTime =  {
                sootheTime: utils.nestedReqField(req.body, 'firstWeekTime', 'sootheTime'),
                firstCriedOut: utils.nestedReqField(req.body, 'firstWeekTime', 'firstCriedOut'),
                secondCriedOut: utils.nestedReqField(req.body, 'firstWeekTime', 'secondCriedOut'),
                followingCriedOut: utils.nestedReqField(req.body, 'firstWeekTime', 'followingCriedOut'),
            };
            plan.secondWeekTime = {
                sootheTime: utils.nestedReqField(req.body, 'secondWeekTime', 'sootheTime'),
                firstCriedOut: utils.nestedReqField(req.body, 'secondWeekTime', 'firstCriedOut'),
                secondCriedOut: utils.nestedReqField(req.body, 'secondWeekTime', 'secondCriedOut'),
                followingCriedOut: utils.nestedReqField(req.body, 'secondWeekTime', 'followingCriedOut'),
            };
            plan.followingWeekTime = {
                sootheTime: utils.nestedReqField(req.body, 'followingWeekTime', 'sootheTime'),
                firstCriedOut: utils.nestedReqField(req.body, 'followingWeekTime', 'firstCriedOut'),
                secondCriedOut: utils.nestedReqField(req.body, 'followingWeekTime', 'secondCriedOut'),
                followingCriedOut: utils.nestedReqField(req.body, 'followingWeekTime', 'followingCriedOut'),
            };

            plan.save(function (err, plan) {
                if (err) return next(err);
                return res.json(utils.encodeResponseBody(req, {
                    _id: plan._id
                }));
            });
        }
    });
});

/**
 * Reset sleep training plan. Set isActive to false.
 */
router.get("/reset", function(req, res, next) {
    metric.increaseCounter('SleepService:Usage:TrainingPlan:Reset', function (err, jsonObj) {
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

    TrainingPlan.update({ 'userId': id, isActive: true }, {isActive: false}, function (err) {
        if (err) {
            return next(err);
        }
        return res.json(utils.encodeResponseBody(req, {'Result': true}));
    });
});

module.exports = router;
