var express = require('express');
var router = express.Router();
var BabyInfo = require("../models/BabyInfo");
var utils = require('servicecommonutils')

router.get("/", function(req, res, next) {
    var id = req.headers['userId'];
    if (!id) {
        return res.json(utils.encodeResponseBody(req, {
            "message": "User id not found.",
            "errorCode": "UNKNOWN_USER"
        }));
    }

    BabyInfo.findOne({ 'userId': id }, function (err, baby) {
        if (err) {
            return next(err);
        }

        if (baby == null) {
            return res.json(utils.encodeResponseBody(req, {
                message: "Failed to find the baby information with this account.",
                errorCode: "BABY_NOT_EXISTS",
            }));
        } else {
            return res.json(utils.encodeResponseBody(req, {
                name: baby.name,
                birthday: baby.birthday,
                gender: baby.gender,
            }));
        }
    });
});

/*
* Add or update baby info.
* req.body.birthday: in 'yyyy-MM-dd' format
*/
router.post("/", function(req, res, next) {
    var id = req.headers['userId'];
    if (!id) {
        return res.json(utils.encodeResponseBody(req, {
            "message": "User id not found.",
            "errorCode": "UNKNOWN_USER"
        }));
    }

    BabyInfo.findOne({ 'userId': id }, function (err, baby) {
        if (err) {
            return next(err);
        }

        if (baby == null) {
            baby = new BabyInfo({
                "userId": req.params.userid,
                "name": req.body.name,
                "birthday": req.body.birthday,
                "gender": req.body.gender
            });

            baby.save(function (err, baby) {
                if (err) {
                    return next(err);
                }

                res.json(utils.encodeResponseBody(req, {
                    name: baby.name,
                    birthday: baby.birthday,
                    gender: baby.gender,
                }));
            });
        } else {
            baby.name = req.body.name;
            baby.gender = req.body.gender;
            baby.birthday = req.body.birthday;

            baby.save(function (err, baby) {
                if (err) return next(err);

                res.json(utils.encodeResponseBody(req, {
                    name: baby.name,
                    birthday: baby.birthday,
                    gender: baby.gender,
                }));
            });
        }
    });
});

module.exports = router;
