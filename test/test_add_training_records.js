var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var TrainingRecord = require('../models/TrainingRecord');
var TrainingPlan = require('../models/TrainingPlan')

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/trainrecs/';

var commonUtils = require('servicecommonutils')
var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/trainrecs', function() {

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            TrainingRecord.remove({}, function (err) {
                TrainingPlan.remove({}, function (err) {
                    done()
                })
            });
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('POST \'/trainrecs\'', function() {
        var plan = new TrainingPlan({
            userId : '5879e8dc04459f4965f67059',
            "startDate": new Date(),
            "isActive": true,
            "firstWeekTime":  {
                sootheTime: 2,
                firstCriedOut: 1,
                secondCriedOut: 3,
                followingCriedOut: 5,
            },
            "secondWeekTime": {
                sootheTime: 2,
                firstCriedOut: 2,
                secondCriedOut: 4,
                followingCriedOut: 6,
            },
            "followingWeekTime": {
                sootheTime: 2,
                firstCriedOut: 3,
                secondCriedOut: 6,
                followingCriedOut: 9,
            }
        });

        before(function(done) {
            plan.save(function (err, plan) {
                if (err) return done(err)
                console.log(plan._id)
                done()
            })
        })

        it('should successfully add sleep record.', function(done) {
            redisClient.set('userId', plan.userId)
            var formData = {
                'planId': plan._id.toString(),
                "elapsedTime": 65535000,
                "criedOutTimes": 2,
                "sootheTimes": 1
            };

            request.post({
                url: endpoint, form: formData,
                headers: {
                    'x-auth-token': plan.userId,
                    'is-internal-request': 'YES'
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                console.log(body)
                expect(res.statusCode).to.equal(200);
                TrainingRecord.findOne({"_id": json._id}, function (err, rec) {
                    if (err) done(err);

                    expect(rec.planId).to.equal(formData.planId);
                    expect(rec.elapsedTime).to.equal(formData.elapsedTime);
                    expect(rec.criedOutTimes).to.equal(formData.criedOutTimes);
                    expect(rec.sootheTimes).to.equal(formData.sootheTimes);
                    done();
                });
            });
        });
    });
});
