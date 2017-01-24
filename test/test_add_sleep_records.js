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
        it('should successfully add sleep record.', function(done) {
            var formData = {
                'userId': '5879e8dc04459f4965f67059',
                "fallAsleepTime": '2017-01-13T08:20:05Z',
                "wakeupTime": '2017-01-13T10:20:05Z',
                "timezone": 'America/Los_Angeles'
            };
            request.post({url: endpoint, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                SleepRecord.findOne({"_id": json._id}, function (err, rec) {
                    if (err) done(err);
                    console.log(rec);
                    expect(rec.timezone).to.equal(formData.timezone);
                    expect(rec.userId).to.equal(formData.userId);
                    expect(new Date(formData.fallAsleepTime).getTime() - rec.fallAsleepTime.getTime()).to.equal(0);
                    expect(new Date(formData.wakeupTime).getTime() - rec.wakeupTime.getTime()).to.equal(0);
                    done();
                });
            });
        });
    });

    describe('POST \'/sleeprecs/\'', function() {
        var rec = new SleepRecord({
            "userId": '5879e8dc04459f4965f67059',
            "fallAsleepTime": new Date('2017-01-15T08:20:05Z'),
            "wakeupTime": new Date('2017-01-15T10:20:05Z'),
            "timezone": 'America/Los_Angeles'
        });

        before(function (done) {
            SleepRecord.remove({}, function () {
                rec.save(function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });

        it('should return TIME_OVERLAP - 1.', function(done) {
            var formData = {
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2017-01-15T09:20:05Z'),
                "wakeupTime": new Date('2017-01-15T12:20:05Z'),
                "timezone": 'America/Los_Angeles'
            };
            request.post({url: endpoint, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 2.', function(done) {
            var formData = {
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2017-01-15T07:20:05Z'),
                "wakeupTime": new Date('2017-01-15T09:20:05Z'),
                "timezone": 'America/Los_Angeles'
            };
            request.post({url: endpoint, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 3.', function(done) {
            var formData = {
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2017-01-15T07:20:05Z'),
                "wakeupTime": new Date('2017-01-15T11:20:05Z'),
                "timezone": 'America/Los_Angeles'
            };
            request.post({url: endpoint, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });

        it('should return TIME_OVERLAP - 4.', function(done) {
            var formData = {
                "userId": '5879e8dc04459f4965f67059',
                "fallAsleepTime": new Date('2017-01-15T09:20:05Z'),
                "wakeupTime": new Date('2017-01-15T10:05:05Z'),
                "timezone": 'America/Los_Angeles'
            };
            request.post({url: endpoint, form: formData}, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('TIME_OVERLAP');
                done();
            });
        });
    });
});
