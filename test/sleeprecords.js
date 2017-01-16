/**
 * Created by huiche on 1/13/17.
 */
var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var SleepRecord = require('../models/SleepRecord');

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('db.mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/sleeprecs/';

describe('/sleeprecs', function() {

    before(function(done) {
        mongoose.connect(dbUrl, function (err) {
            if (err) {
                return done(err);
            }
            console.log("Connected to mongodb: " + dbUrl);
            mongoose.set('debug', true);
            done();
        });
    });

    after(function(done) {
        SleepRecord.remove({}, function (err) {
            mongoose.disconnect();
            done();
        });
    });

    describe('POST \'/sleeprecs/:userid\'', function() {
        it('should successfully add sleep record.', function(done) {
            var userId = '5879e8dc04459f4965f67059';
            var formData = {
                "fallAsleepTime": '2017-01-13T08:20:05Z',
                "wakeupTime": '2017-01-13T10:20:05Z'
            };
            SleepRecord.remove({}, function (err) {
                request.post({url: endpoint + userId, form: formData}, function (err, res, body){
                    if (err) done(err);

                    var json = JSON.parse(body);
                    expect(res.statusCode).to.equal(200);
                    expect(json.userId).to.equal(userId);
                    expect(new Date(formData.fallAsleepTime).getTime() - new Date(json.fallAsleepTime).getTime()).to.equal(0);
                    expect(new Date(formData.wakeupTime).getTime() - new Date(json.wakeupTime).getTime()).to.equal(0);

                    SleepRecord.remove({_id: json._id}, function (err) {
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('POST \'/sleeprecs/:userid\'', function() {
        var rec = new SleepRecord({
            "userId": '5879e8dc04459f4965f67059',
            "fallAsleepTime": new Date('2017-01-15T08:20:05Z'),
            "wakeupTime": new Date('2017-01-15T10:20:05Z')
        });

        before(function (done) {
            SleepRecord.remove({});
            rec.save(function (err) {
                if (err) return done(err);
                done();
            });
        });

        after(function (done) {
            rec.remove(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should return TIME_OVERLAP - 1.', function(done) {
            var formData = {
                "fallAsleepTime": new Date('2017-01-15T09:20:05Z'),
                "wakeupTime": new Date('2017-01-15T12:20:05Z')
            };
            request.post({url: endpoint + rec.userId, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 2.', function(done) {
            var formData = {
                "fallAsleepTime": new Date('2017-01-15T07:20:05Z'),
                "wakeupTime": new Date('2017-01-15T09:20:05Z')
            };
            request.post({url: endpoint + rec.userId, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 3.', function(done) {
            var formData = {
                "fallAsleepTime": new Date('2017-01-15T07:20:05Z'),
                "wakeupTime": new Date('2017-01-15T11:20:05Z')
            };
            request.post({url: endpoint + rec.userId, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 4.', function(done) {
            var formData = {
                "fallAsleepTime": new Date('2017-01-15T09:20:05Z'),
                "wakeupTime": new Date('2017-01-15T10:05:05Z')
            };
            request.post({url: endpoint + rec.userId, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });
    });

    describe('GET \'/sleeprecs/:userid/:fromdate/:todate/:timezone\'', function() {
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
                "wakeupTime": new Date('2016-01-15T10:20:05Z')
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-15T14:20:05Z'),
                "wakeupTime": new Date('2016-01-15T16:20:05Z')
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-15T20:20:05Z'),
                "wakeupTime": new Date('2016-01-16T10:20:05Z')
            }),
            new SleepRecord({
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2016-01-17T20:20:05Z'),
                "wakeupTime": new Date('2016-01-17T23:20:05Z')
            })
        ];

        before(function (done) {
            SleepRecord.remove({});
            recarr.forEach(function (item) {
               item.save(function (err) {
                   if (err) return done(err);
               });
            });
            done();
        });

        after(function (done) {
            recarr.forEach(function (item) {
                item.remove(function (err) {
                    if (err) return done(err);
                });
            });
            done();
        });

        it('should return sleep records.', function(done) {
            request.get({url: endpoint + recarr[0].userId + "/" + from + "/" + to + "/" + timezone}, function (err, res, body){
                if (err) done(err);

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