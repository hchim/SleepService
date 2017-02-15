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

describe('/plan', function() {

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            TrainingPlan.remove({});
            done();
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('GET \'/plan/:userid\'', function() {
        var userId = '5879e8dc04459f4965f67059';
        var plan = new TrainingPlan({
            "startDate": new Date(),
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

        it('should return training plan.', function(done) {
            request.get({url: endpoint + userId}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        it('should return BABY_NOT_EXISTS error.', function(done) {
            var userId = '5879e900e97c9e497940abf6';
            request.get({url: endpoint + userId}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('SLEEP_TRAINING_PLAN_NOT_EXISTS');
                done();
            });
        });
    });
});