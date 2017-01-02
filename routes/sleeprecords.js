var express = require('express');
var router = express.Router();
var SleepRecord = require('../models/SleepRecord');

// router.get("/:userid", function(req, res, next) {
//     BabyInfo.findOne({ 'userId': req.params.userid }, function (err, baby) {
//         if (err) {
//             return next(err);
//         }
//
//         if (baby == null) {
//             res.json({
//                 message: "Failed to find the baby information with this account.",
//                 errorCode: "BABY_NOT_EXISTS",
//             });
//         } else {
//             res.json({
//                 name: baby.name,
//                 birthday: baby.birthday,
//                 gender: baby.gender,
//             });
//         }
//     });
// });

/* Add sleep records. */
router.post("/:userid", function(req, res, next) {
    var userId = req.params.userid;
    var from = new Date(req.body.fallAsleepTime);
    var to = new Date(req.body.wakeupTime);

    SleepRecord.find({ wakeupTime: { $gt: from }, fallAsleepTime: { $lt: to } }, function (err, records) {
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
