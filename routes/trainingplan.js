var express = require('express');
var router = express.Router();
var TrainingPlan = require("../models/TrainingPlan");
var commonUtils = require('servicecommonutils')

router.get("/:userid", function(req, res, next) {
    TrainingPlan.findOne({ 'userId': req.params.userid }, function (err, plan) {
        if (err) {
            return next(err);
        }

        if (plan == null) {
            res.json({
                message: "Failed to find the sleep training plan with this account.",
                errorCode: "SLEEP_TRAINING_PLAN_NOT_EXISTS",
            });
        } else {
            res.json(plan);
        }
    });
});

/*
* Add or update sleep training plan.
*/
router.post("/:userid", function(req, res, next) {
    TrainingPlan.findOne({ 'userId': req.params.userid }, function (err, plan) {
        if (err) {
            return next(err);
        }

        if (plan == null) {
            plan = new TrainingPlan({
                "userId": req.params.userid,
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
                res.json({
                    _id: plan._id
                });
            });
        } else {
            plan.startDate = req.body.startDate;
            plan.firstWeekTime =  {
                sootheTime: commonUtils.nestedReqField(req.body, 'firstWeekTime', 'sootheTime'),
                firstCriedOut: commonUtils.nestedReqField(req.body, 'firstWeekTime', 'firstCriedOut'),
                secondCriedOut: commonUtils.nestedReqField(req.body, 'firstWeekTime', 'secondCriedOut'),
                followingCriedOut: commonUtils.nestedReqField(req.body, 'firstWeekTime', 'followingCriedOut'),
            };
            plan.secondWeekTime = {
                sootheTime: commonUtils.nestedReqField(req.body, 'secondWeekTime', 'sootheTime'),
                firstCriedOut: commonUtils.nestedReqField(req.body, 'secondWeekTime', 'firstCriedOut'),
                secondCriedOut: commonUtils.nestedReqField(req.body, 'secondWeekTime', 'secondCriedOut'),
                followingCriedOut: commonUtils.nestedReqField(req.body, 'secondWeekTime', 'followingCriedOut'),
            };
            plan.followingWeekTime = {
                sootheTime: commonUtils.nestedReqField(req.body, 'followingWeekTime', 'sootheTime'),
                firstCriedOut: commonUtils.nestedReqField(req.body, 'followingWeekTime', 'firstCriedOut'),
                secondCriedOut: commonUtils.nestedReqField(req.body, 'followingWeekTime', 'secondCriedOut'),
                followingCriedOut: commonUtils.nestedReqField(req.body, 'followingWeekTime', 'followingCriedOut'),
            };

            plan.save(function (err, plan) {
                if (err) return next(err);
                res.json({
                    _id: plan._id
                });
            });
        }
    });
});

module.exports = router;
