var express = require('express');
var router = express.Router();
var BabyInfo = require("../models/BabyInfo");

router.get("/:userid", function(req, res, next) {
  BabyInfo.findOne({ 'userId': req.params.userid }, function (err, baby) {
    if (err) {
      return next(err);
    }

    if (baby == null) {
      res.json({
        message: "Failed to find the baby information with this account.",
        errorCode: "BABY_NOT_EXISTS",
      });
    } else {
      res.json({
        name: baby.name,
        birthday: baby.birthday,
        gender: baby.gender,
      });
    }
  });
});

/* Add or update baby info. */
router.post("/:userid", function(req, res, next) {
  BabyInfo.findOne({ 'userId': req.params.userid }, function (err, baby) {
    if (err) {
      return next(err);
    }

    if (baby == null) {
      baby = new BabyInfo({
        "userId": req.params.userId,
        "name": req.body.name,
        "birthday": new Date(req.body.birthday),
        "gender": req.body.gender
      });

      baby.save(function (err, baby) {
        if (err) {
          return next(err);
        }

        res.json({
          name: baby.name,
          birthday: baby.birthday,
          gender: baby.gender,
        });
      });
    } else {
      res.json({
        name: baby.name,
        birthday: baby.birthday,
        gender: baby.gender,
      });
    }
  });
});

module.exports = router;