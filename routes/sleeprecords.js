var express = require('express');
var router = express.Router();
var SleepRecord = require('../models/SleepRecord');

/**
 * :userid : get the records of the given user.
 * :fromdate : wakeupTime >= fromdate + 00:00:00
 * :todate : fallAsleepTime <= todate + 23:59:59
 *
 * Return format:
 *
 * {
 *   "records": [
 *      {
 *          "date": Date,
 *          "times": [{
 *              "fallAsleepTime": datetime,
 *              "wakeupTime": datetime,},
 *              ...,
 *              {}
 *          ],
 *          "quality": Number
 *      },
 *      ...,
 *      {}
 *   ]
 * }
 */
router.get("/:userid/:fromdate/:todate", function(req, res, next) {
    var userId = req.params.userid;
    var to = new Date(req.params.todate + "T23:59:59Z");
    var from = new Date(req.params.fromdate + "T00:00:00Z");

    SleepRecord.find({ userId: userId, wakeupTime: { $gte: from }, fallAsleepTime: { $lte: to } }, function (err, records) {
        if (err) return next(err);

        var arr = [];
        var date = 0;
        var val = {};

        for (var i = 0, len = records.length; i < len; i++) {
            var rec = records[i];
            // date changed
            if (date != rec.fallAsleepTime.getDate()) {
                date = rec.fallAsleepTime.getDate();
                val = {"date": rec.fallAsleepTime, "times": [], "quality": 0};
                arr.push(val);
            }

            if (rec.fallAsleepTime.getDate() != rec.wakeupTime.getDate()) {
                val.times.push({
                    "fallAsleepTime": rec.fallAsleepTime,
                    "wakeupTime": new Date(
                        rec.fallAsleepTime.getYear(),
                        rec.fallAsleepTime.getMonth(),
                        rec.fallAsleepTime.getDate(),
                        23, 59, 59
                    ),
                });

                date = rec.wakeupTime.getDate();
                val = {"date": rec.wakeupTime, "times": [], "quality": 0};
                arr.push(val);
                val.times.push({
                    "fallAsleepTime": new Date(
                        rec.wakeupTime.getYear(),
                        rec.wakeupTime.getMonth(),
                        rec.wakeupTime.getDate()
                    ),
                    "wakeupTime": rec.wakeupTime,
                });
            } else {
                val.times.push({
                    "fallAsleepTime": rec.fallAsleepTime,
                    "wakeupTime": rec.wakeupTime,
                });
            }
        }

        //TODO calculate sleep quality

        res.json({"records": arr});
    });
});

/* Add sleep records. */
router.post("/:userid", function(req, res, next) {
    var userId = req.params.userid;
    var from = new Date(req.body.fallAsleepTime);
    var to = new Date(req.body.wakeupTime);

    SleepRecord.find({ userId: userId, wakeupTime: { $gt: from }, fallAsleepTime: { $lt: to } }, function (err, records) {
        if (err) return next(err);
        if (records.length > 0) {
            res.json({
                "message": "The sleep record time overlap with existing records.",
                "errorCode": "TIME_OVERLAP",
            });
        } else {
            var record = new SleepRecord({
                "userId": userId,
                "fallAsleepTime": from,
                "wakeupTime": to,
            });

            record.save(function (err, record) {
                if (err) return next(err);

                res.json({
                    "_id": record._id,
                    "userId": userId,
                    "fallAsleepTime": from,
                    "wakeupTime": to,
                });
            });
        }
    });
});

module.exports = router;
