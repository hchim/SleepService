var TZDate = require('../utils/TZDate');

const DAYTIME_BEGIN = 7 * 60; //7AM
const DAYTIME_END = 19 * 60;  //7PM
const STANDARD_DAYTIME = [510, 480, 360, 300, 210, 180, 150]
const STANDARD_NIGHTTIME = [510, 540, 600, 600, 660, 660, 660]
const alpha = 0.25
const weights = [0.5, 0.3, 0.2]
const VAL1_THRESHOLD = 0.6 //when val1 is larger than this value, we calculate val2 and val3
/*
Newborn
    Nighttime: 8 1/2
    Daytime: 8 1/2 (varied number of naps)
1 month
    Nighttime: 9
    Daytime: 8 (varied number of naps)
3 months
    Nighttime: 10
    Daytime Sleep: 6 (three naps)
6 months
    Nighttime: 10
    Daytime: 5 (two or three naps)
9 months
    Nighttime: 11
    Daytime: 3 1/2 (two naps)
12 months
    Nighttime: 11
    Daytime: 3 (two naps)
18 months
    Nighttime: 11
    Daytime: 2 1/2 (one nap)
*/

function statSleepTimes(timePairs) {
    var sleepTime = {
        dayTime: 0, nightTime: 0, wakeupTimes: 0
    }

    if (timePairs == null)
        return sleepTime

    for (var i = 0; i < timePairs.times.length; i++) {
        var wakeupTime = new TZDate(timePairs.times[i].wakeupTime)
        var fallAsleepTime = new TZDate(timePairs.times[i].fallAsleepTime)
        var fMin = fallAsleepTime.minute + fallAsleepTime.hour * 60;
        var wMin = wakeupTime.minute + wakeupTime.hour * 60;

        if (wMin <= DAYTIME_BEGIN) {
            sleepTime.nightTime += (wMin - fMin);
            if (fMin > 0) // not start from 00:00
                sleepTime.wakeupTimes += 1;
        } else if (fMin >= DAYTIME_END) {
            sleepTime.nightTime += (wMin - fMin);
            if (wMin < (23 * 60 + 59)) // not end to 23:59
                sleepTime.wakeupTimes += 1;
        } else if (fMin > DAYTIME_BEGIN && wMin < DAYTIME_END) {
            sleepTime.dayTime += (wMin - fMin);
        } else if (fMin < DAYTIME_BEGIN && wMin < DAYTIME_END) {
            sleepTime.nightTime += (DAYTIME_BEGIN - fMin);
            sleepTime.dayTime += (wMin - DAYTIME_BEGIN);
        } else if (fMin < DAYTIME_BEGIN && wMin >DAYTIME_END) {
            sleepTime.dayTime = DAYTIME_END - DAYTIME_BEGIN;
            sleepTime.nightTime = (DAYTIME_BEGIN - fMin) + (wMin - DAYTIME_END);
        } else { //fMin > DAYTIME_BEGIN and fMin < DAYTIME_END and win > DAYTIME_END
            sleepTime.dayTime = DAYTIME_END - fMin;
            sleepTime.nightTime = wMin - DAYTIME_END;
        }
    }
    return sleepTime;
}

function getStandardValue(days, stdArr) {
    var index;

    if (days > 18 * 30) {
        index = 6;
    } else if (days > 365) {
        index = 5;
    } else if (days > 270) {
        index = 4;
    } else if (days > 180) {
        index = 3;
    } else if (days > 90) {
        index = 2;
    } else if (days > 30) {
        index = 1;
    } else {
        index = 0;
    }

    return stdArr[index];
}

module.exports = {
    version: 'v1.0.0',
    /**
     * Estimate the sleep quality of the baby.
     * @param timePairs sleep records
     * @param birthday birthday
     */
    estimateSleepQuality: function(timePairs, days) {
        if (timePairs == null || timePairs.length == 0) {
            return;
        }

        var sleepTime = statSleepTimes(timePairs);
        var stdDay = getStandardValue(days, STANDARD_DAYTIME)
        var stdNight = getStandardValue(days, STANDARD_NIGHTTIME)

        //total sleep time
        var val1 = (sleepTime.dayTime + sleepTime.nightTime) / (stdDay + stdNight);
        if (val1 > 1) val1 = 1;

        var val2 = 0;
        var val3 = 0;
        if (val1 > VAL1_THRESHOLD) {
            //daytime and nighttime sleep time ratio
            var std_ratio = stdDay/stdNight
            var ratio = sleepTime.dayTime/sleepTime.nightTime
            if (isNaN(ratio)) ratio = 0
            val2 = 1 - Math.abs(ratio - std_ratio) / std_ratio
            if (val2 < 0) val2 = 0

            //night wakeup times
            val3 = 1 / Math.pow(Math.E, alpha * sleepTime.wakeupTimes)
        }

        timePairs.quality = (val1 * weights[0] + val2 * weights[1] + val3 * weights[2]) * 10
    }
}