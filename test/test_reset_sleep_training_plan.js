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
var dbUrl = conf.get('mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/plan/';

var commonUtils = require('servicecommonutils')
var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/plan', function() {
    var userId = '5879e8dc04459f4965f67059';
    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            TrainingPlan.remove({});
            redisClient.set(userId, userId)

            done();
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('GET \'/plan\'', function() {
        var plan = new TrainingPlan({
            "startDate": new Date(),
            "isActive": true,
            "userId": userId,
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

        before(function (done) {
            plan.save(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should reset training plan.', function(done) {
            request.get({
                url: endpoint + 'reset',
                headers: {
                    'x-auth-token': userId,
                    'is-internal-request': 'YES'
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.Result).to.equal(true);
                done();
            });
        });
    });
});