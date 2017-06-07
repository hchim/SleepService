var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var SleepRecord = require("sleepservicemodels").SleepRecord(mongoose.connection);

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/sleeprecs/';

var commonUtils = require('servicecommonutils')
var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/sleeprecs', function() {

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            SleepRecord.remove({}, function (err) {
                done();
            });
        });
    });

    after(function(done) {
        mongoose.disconnect();
        done();
    });

    describe('POST \'/sleeprecs\'', function() {
        var userId = '5879e8dc04459f4965f67059'
        var rec = new SleepRecord({
            "userId": userId,
            "fallAsleepTime": '2017-01-13T08:20:05Z',
            "wakeupTime": '2017-01-13T10:20:05Z',
            "timezone": 'America/Los_Angeles'
        });

        before(function (done) {
            rec.save(function (err, rec) {
                if (err) done(err);
                done();
            })
        });

        it('should successfully add sleep record.', function(done) {
            redisClient.set(userId, userId)

            request.delete({
                url: endpoint + rec._id,
                headers: {
                    'x-auth-token': userId,
                    'is-internal-request': 'YES'
                }
            }, function (err, res, body){
                if (err) done(err);
                console.log(body)
                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.result).to.equal(true);
                SleepRecord.findOne({"_id": rec._id}, function (err, rec) {
                    if (err) done(err);
                    console.log(rec);
                    expect(rec).to.equal(null);
                    done();
                });
            });
        });
    });
});
