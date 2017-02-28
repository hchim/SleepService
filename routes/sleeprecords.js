var express = require('express');
var router = express.Router();
var SleepRecord = require('../models/SleepRecord');
var BabyInfo = require('../models/BabyInfo')
var moment = require('moment-timezone');
var TZDate = require('../utils/TZDate');
var sqmodel = require('../utils/SleepQualityModel')
var clone = require('clone');

/*
 * datetime: yyyy-MM-dd hh:mm:ss
 * timezone: timezone string
 */
function toDateOfTimezone(datetime, timezone) {
    var date_tz = moment.tz(datetime, timezone);
    return new Date(date_tz.toString());
}

/**
 * @param date Date object
 * @param timezone string
 */
function toTZDateFormat(date, timezone) {
    var date_tz = moment.tz(date.toISOString(), timezone);
    var datestr = date_tz.format();
    return datestr
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
router.get("/:fromdate/:todate/:timezone", function(req, res, next) {
    console.log(req.headers)
    var id = req.headers['userId'];
    if (!id) {
        return res.json({
            "message": "User id not found.",
            "errorCode": "UNKNOWN_USER"
        });
    }

    var timezone = req.params.timezone.replace('-', '/');
    var to = toDateOfTimezone(req.params.todate + " 23:59:59", timezone);
    var from = toDateOfTimezone(req.params.fromdate + " 00:00:00", timezone);

    SleepRecord.find({ userId: id, wakeupTime: { $gte: from }, fallAsleepTime: { $lte: to } })
        .sort({fallAsleepTime: 1})
        .exec(function (err, records) {
        if (err) return next(err);

        var arr = processSleepRecords(records)
        BabyInfo.findOne({userId: id}, function (err, baby) {
            //if err or baby info not exist
            if (err || baby == null) {
                return res.json({"records": arr});
            }

            //calculate sleep quality
            var birthday = new Date(baby.birthday)
            calculateSleepQuality(arr, birthday)
            res.json({"records": arr});
        })
    });
});


/**
 * Grouping sleep records based on date. If one of the sleep record across two days, split it.
 * @param records
 * @returns {Array}
 */
function processSleepRecords(records) {
    var arr = [];
    var date = null;
    var val = {};

    for (var i = 0, len = records.length; i < len; i++) {
        var rec = records[i];
        //convert date time of the timezone
        var tzFallAsleep = new TZDate(toTZDateFormat(rec.fallAsleepTime, rec.timezone));
        var tzWakeup = new TZDate(toTZDateFormat(rec.wakeupTime, rec.timezone));

        // date changed
        if (date == null || !date.sameDay(tzFallAsleep)) {
            date = tzFallAsleep;
            val = {"date": tzFallAsleep.toString(), "times": [], "quality": 0};
            arr.push(val);
        }

        if (tzFallAsleep.date != tzWakeup.date) {
            var newFallAsleep = clone(tzFallAsleep);
            newFallAsleep.hour = 23;
            newFallAsleep.minute = 59;
            newFallAsleep.second = 59;
            val.times.push({
                "fallAsleepTime": tzFallAsleep.toString(),
                "wakeupTime": newFallAsleep.toString(),
            });

            date = tzWakeup;
            val = {"date": tzWakeup.toString(), "times": [], "quality": 0};
            arr.push(val);
            var newWakeup = clone(tzWakeup)
            newWakeup.hour = 0;
            newWakeup.minute = 0;
            newWakeup.second = 0;
            val.times.push({
                "fallAsleepTime": newWakeup.toString(),
                "wakeupTime": tzWakeup.toString(),
            });
        } else {
            val.times.push({
                "fallAsleepTime": tzFallAsleep.toString(),
                "wakeupTime": tzWakeup.toString(),
            });
        }
    }

    return arr;
}

/**
 * Calculate sleep quality.
 * @param arr
 * @param birthday
 */
function calculateSleepQuality(arr, birthday) {
    for (var i = 0; i < arr.length; i++) {
        var date = new TZDate(arr[i].date)
        var days = Math.round(Math.abs((date.getTime() - birthday)
            / (24 * 60 * 60 * 1000)));
        sqmodel.estimateSleepQuality(arr[i], days)
    }
}

/* Add sleep records. */
router.post("/", function(req, res, next) {
    var id = req.headers['userId'];
    if (!id) {
        return res.json({
            "message": "User id not found.",
            "errorCode": "UNKNOWN_USER"
        });
    }

    var from = new Date(req.body.fallAsleepTime);
    var to = new Date(req.body.wakeupTime);
    var tz = req.body.timezone;

    SleepRecord.find({ userId: id, wakeupTime: { $gt: from }, fallAsleepTime: { $lt: to } }, function (err, records) {
        if (err) return next(err);
        if (records.length > 0) {
            res.json({
                "message": "The sleep record time overlaps with existing records.",
                "errorCode": "TIME_OVERLAP",
            });
        } else {
            var record = new SleepRecord({
                "userId": id,
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
