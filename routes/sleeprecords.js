var express = require('express');
var router = express.Router();
var SleepRecord = require('../models/SleepRecord');
var moment = require('moment-timezone');
var TZDate = require('../utils/TZDate');

/*
 * datetime: yyyy-MM-dd hh:mm:ss
 * timezone: timezone string
 */
function toDateOfTimezone(datetime, timezone) {
    var date_tz = moment.tz(datetime, timezone);
    return new Date(date_tz.toString());
}

/**
 * :userid : get the records of the given user.
 * :fromdate : wakeupTime >= fromdate + 00:00:00
 * :todate : fallAsleepTime <= todate + 23:59:59
 *
 * Return format:
 *
 * records and times in assending order.
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
router.get("/:userid/:fromdate/:todate/:timezone", function(req, res, next) {
    var userId = req.params.userid;
    var timezone = req.params.timezone.replace('-', '/');
    var to = toDateOfTimezone(req.params.todate + " 23:59:59", timezone);
    var from = toDateOfTimezone(req.params.fromdate + " 00:00:00", timezone);

    SleepRecord.find({ userId: userId, wakeupTime: { $gte: from }, fallAsleepTime: { $lte: to } })
        .sort({fallAsleepTime: 1})
        .exec(function (err, records) {
        if (err) return next(err);

        var arr = [];
        var date = null;
        var val = {};

        for (var i = 0, len = records.length; i < len; i++) {
            var rec = records[i];
            //convert date time of the timezone
            var tzFallAsleep = new TZDate(rec.fallAsleepTime, rec.timezone);
            var tzWakeup = new TZDate(rec.wakeupTime, rec.timezone);
            var tzFallAsleepStr = tzFallAsleep.toString();
            var tzWakeupStr = tzWakeup.toString();

            // date changed
            if (date == null || !date.sameDay(tzFallAsleep)) {
                date = tzFallAsleep;
                val = {"date": tzFallAsleepStr, "times": [], "quality": 0};
                arr.push(val);
            }

            if (tzFallAsleep.date != tzWakeup.date) {
                tzFallAsleep.hour = 23;
                tzFallAsleep.minute = 59;
                tzFallAsleep.second = 59;
                val.times.push({
                    "fallAsleepTime": tzFallAsleepStr,
                    "wakeupTime": tzFallAsleep.toString(),
                });

                date = tzWakeup;
                val = {"date": tzWakeupStr, "times": [], "quality": 0};
                arr.push(val);
                tzWakeup.hour = 0;
                tzWakeup.minute = 0;
                tzWakeup.second = 0;
                val.times.push({
                    "fallAsleepTime": tzWakeup.toString(),
                    "wakeupTime": tzWakeupStr,
                });
            } else {
                val.times.push({
                    "fallAsleepTime": tzFallAsleepStr,
                    "wakeupTime": tzWakeupStr,
                });
            }
        }

        //TODO calculate sleep quality

        res.json({"records": arr});
    });
});

/* Add sleep records. */
router.post("/", function(req, res, next) {
    var userId = req.body.userId;
    var from = new Date(req.body.fallAsleepTime);
    var to = new Date(req.body.wakeupTime);
    var tz = req.body.timezone;

    SleepRecord.find({ userId: userId, wakeupTime: { $gt: from }, fallAsleepTime: { $lt: to } }, function (err, records) {
        if (err) return next(err);
        if (records.length > 0) {
            res.json({
                "message": "The sleep record time overlaps with existing records.",
                "errorCode": "TIME_OVERLAP",
            });
        } else {
            var record = new SleepRecord({
                "userId": userId,
                "fallAsleepTime": from,
                "wakeupTime": to,
                "timezone": tz
            });

            record.save(function (err, record) {
                if (err) return next(err);

                res.json({
                    "_id": record._id
                });
            });
        }
    });
});

module.exports = router;
