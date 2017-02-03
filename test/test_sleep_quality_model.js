/**
 * Created by huiche on 2/1/17.
 */
var sqmodels = require('../utils/SleepQualityModel')
var expect = require('Chai').expect;

describe('estimate sleep quality', function () {
    it('', function (done) {
        var timePairs = { date: '2016-01-17T12:20:05-08:00',
            times:
                [
                    { fallAsleepTime: '2016-01-17T00:00:00-08:00',
                        wakeupTime: '2016-01-17T04:20:05-08:00' } ,
                    { fallAsleepTime: '2016-01-17T05:20:05-08:00',
                        wakeupTime: '2016-01-17T07:00:05-08:00' } ,
                    { fallAsleepTime: '2016-01-17T11:00:05-08:00',
                        wakeupTime: '2016-01-17T12:20:05-08:00' } ,
                    { fallAsleepTime: '2016-01-17T15:30:05-08:00',
                        wakeupTime: '2016-01-17T17:00:05-08:00' } ,
                    { fallAsleepTime: '2016-01-17T19:20:05-08:00',
                        wakeupTime: '2016-01-17T23:59:05-08:00' } ,
                ],
            quality: 0 }

        sqmodels.estimateSleepQuality(timePairs, 300)
        expect(timePairs.quality).to.be.above(0)
        done()
    })
})

