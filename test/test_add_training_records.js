var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var TrainingRecord = require('../models/TrainingRecord');

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('db.mongodb.url');
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
                done();
            });
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('POST \'/trainrecs\'', function() {
        it('should successfully add sleep record.', function(done) {
            var userId = '5879e900e97c9e497940abf6';
            redisClient.set(userId, userId)

            var formData = {
                'planId': '5879e8dc04459f4965f67059',
                "elapsedTime": 65535000,
                "criedOutTimes": 2,
                "sootheTimes": 1
            };
            request.post({
                url: endpoint, form: formData,
                headers: {
                    'x-auth-token': userId
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
