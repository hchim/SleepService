var express = require('express');
var router = express.Router();
var TrainingRecord = require("../models/TrainingRecord");

router.post("/", function(req, res, next) {
    //TODO check plan id belongs to user
    var record = new TrainingRecord({
        planId: req.body.planId,
        elapsedTime: req.body.elapsedTime,
        sootheTimes: req.body.sootheTimes,
        criedOutTimes: req.body.criedOutTimes
    });

    record.save(function (err, record) {
        if (err) return next(err);
        res.json({'_id': record._id});
    });
});

module.exports = router;