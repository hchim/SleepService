/**
 * Created by huiche on 1/13/17.
 */
var assert = require('assert');
var mongoose = require('mongoose');
var conf = require("../config");
var request = require('request');
var expect = require('Chai').expect;
var BabyInfo = require('../models/BabyInfo');

var port = conf.get('server.port');
var ip = conf.get("server.ip");
var dbUrl = conf.get('db.mongodb.url');
var endpoint = 'http://' + ip + ':' + port + '/babyinfos/';

var commonUtils = require('servicecommonutils')
var redisClient = commonUtils.createRedisClient(conf.get('redis.host'), conf.get('redis.port'))

describe('/babyinfos', function() {

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
        mongoose.disconnect();
        done();
    });

    describe('GET \'/babyinfos/:userid\'', function() {
        var baby = new BabyInfo({
            "userId": '5879e900e97c9e497940abf8',
            "name": 'Test',
            "birthday": new Date('Sat, 14 Jan 2017 09:01:52 GMT'),
            "gender": 1
        });

        before(function (done) {
            BabyInfo.remove({});
            baby.save(function (err) {
                if (err) return done(err);
                redisClient.set(baby.userId, baby.userId)
                done();
            });
        });

        after(function (done) {
            baby.remove(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should return baby info.', function(done) {
            request.get({
                url: endpoint,
                headers: {
                    'x-auth-token': baby.userId
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.name).to.equal(baby.name);
                done();
            });
        });

        it('should return BABY_NOT_EXISTS error.', function(done) {
            var userId = '5879e900e97c9e497940abf6';
            redisClient.set(userId, userId)
            request.get({
                url: endpoint,
                headers: {
                    'x-auth-token': userId
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.errorCode).to.equal('BABY_NOT_EXISTS');
                done();
            });
        });
    });

    describe('POST \'/babyinfos\'', function() {

        before(function(done) {
            BabyInfo.remove({});
            done();
        });

        it('should successfully add baby info.', function(done) {
            var baby = new BabyInfo({
                "userId": '5879e8dc04459f4965f67059',
                "name": 'Test',
                "birthday": new Date('Sat, 14 Jan 2017 09:01:52 GMT'),
                "gender": 1
            });
            var formData = {
                name: baby.name,
                birthday: baby.birthday,
                gender: baby.gender
            };
            redisClient.set(baby.userId, baby.userId)
            request.post({
                url: endpoint, form: formData,
                headers: {
                    'x-auth-token': baby.userId
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.name).to.equal(baby.name);

                BabyInfo.remove({userId: baby.userId}, function (err) {
                    if (err) return done(err);
                    done();
                })
            });
        });
    });

    describe('POST \'/babyinfos\'', function() {
        var baby = new BabyInfo({
            "userId": '5879e6d090f623487fd35e8e',
            "name": 'Test',
            "birthday": new Date('Sat, 14 Jan 2017 09:01:52 GMT'),
            "gender": 1
        });

        before(function (done) {
            BabyInfo.remove({});
            baby.save(function (err) {
                if (err) return done(err);
                redisClient.set(baby.userId, baby.userId)
                done();
            });
        });

        after(function (done) {
            baby.remove(function (err) {
                if (err) return done(err);
                done();
            });
        });

        it('should return updated baby info.', function(done) {
            var formData = {
                name: 'NeaName',
                birthday: baby.birthday,
                gender: 0
            };
            request.post({
                url: endpoint, form: formData,
                headers: {
                    'x-auth-token': baby.userId
                }
            }, function (err, res, body){
                if (err) done(err);

                var json = JSON.parse(body);
                expect(res.statusCode).to.equal(200);
                expect(json.name).to.equal(formData.name);
                expect(json.gender).to.equal(formData.gender);
                done();
            });
        });
    });
});