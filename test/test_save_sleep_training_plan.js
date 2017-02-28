/**
 * Created by huiche on 1/13/17.
 */
var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var TrainingPlan = require('../models/TrainingPlan');

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('db.mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/plan/';

var commonUtils = require('servicecommonutils')
var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/plan', function() {
    var userId = '5879e8dc04459f4965f67059'

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            redisClient.set(userId, userId)

            done();
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('POST \'/plan\'', function() {

        before(function(done) {
            TrainingPlan.remove({});
            done();
        });

        it('should successfully add training plan.', function(done) {
            var formData = {
                "startDate": new Date(),
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
            };
            request.post({
                url: endpoint, form: formData,
                headers: {
                    'x-auth-token': userId
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    });
});