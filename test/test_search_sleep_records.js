/**
 * Created by huiche on 1/13/17.
 */
var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var SleepRecord = require('../models/SleepRecord');
var BabyInfo = require('../models/BabyInfo')
var commonUtils = require('servicecommonutils')

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('db.mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/sleeprecs/';

var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/sleeprecs', function() {

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            var baby = new BabyInfo({
                userId: '5879e8dc04459f4965f67059',
                name: 'babyname',
                birthday: new Date(2015, 11, 22),
                gender: 1
            })

            baby.save(function (err) {
                if (err) done(err)
                //set login session
                redisClient.set(baby.userId, baby.userId)
                done()
            })
        });
    });

    after(function(done) {
        SleepRecord.remove({}, function (err) {
            mongoose.disconnect();
            BabyInfo.remove({}, function (err) {
                done()
            })
        });
    });

    describe('GET \'/sleeprecs/:fromdate/:todate/:timezone\'', function() {
        var from = '2016-01-14';
        var to = '2016-01-17';
        var timezone = 'America-Los_Angeles';

        var recarr = [
            /*
             PST Times
             2016-01-14 22:20:05, 2016-01-15 02:20:05,
             2016-01-15 06:20:05, 2016-01-15 08:20:05,
             2016-01-15 12:20:05, 2016-01-16 02:20:05,
             2016-01-17 12:20:05, 2016-01-17 15:20:05,
             14, 1
             15, 3
             16, 1
             17, 1
             */
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-15T06:20:05Z'),
                "wakeupTime": new Date('2016-01-15T10:20:05Z'),
                "timezone": 'America/Los_Angeles'
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-15T14:20:05Z'),
                "wakeupTime": new Date('2016-01-15T16:20:05Z'),
                "timezone": 'America/Los_Angeles'
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-15T20:20:05Z'),
                "wakeupTime": new Date('2016-01-16T10:20:05Z'),
                "timezone": 'America/Los_Angeles'
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-17T20:20:05Z'),
                "wakeupTime": new Date('2016-01-17T23:20:05Z'),
                "timezone": 'America/Los_Angeles'
            })
        ];

        before(function (done) {
            SleepRecord.remove({}, function (err) {
                recarr.forEach(function (item) {
                    item.save(function (err) {
                        if (err) return done(err);
                    });
                });
                done();
            });
        });

        it('should return sleep records.', function(done) {
            request.get({
                url: endpoint + from + "/" + to + "/" + timezone,
                headers: {
                    'x-auth-token': recarr[0].userId,
                    'is-internal-request': 'YES'
                }
            }, function (err, res, body){
                if (err) done(err);
                console.log(body)
                var json = JSON.parse(body);
                var records = json.records;

                expect(res.statusCode).to.equal(200);
                expect(records.length).to.equal(4);
                expect(records[0].times.length).to.equal(1);
                expect(records[1].times.length).to.equal(3);
                expect(records[2].times.length).to.equal(1);
                expect(records[3].times.length).to.equal(1);
                done();
            });
        });
    });
});