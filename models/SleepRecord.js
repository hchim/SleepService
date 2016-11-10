var mongoose = require("mongoose");
var conf = require("../config");

var sleepRecordSchema = mongoose.Schema({
    userId: String,
    fallAsleepTime: Date,
    wakeupTime: Date,
});

// indexes

sleepRecordSchema.index({ userId: 1, fallAsleepTime: -1 });

if (conf.get("env") === 'production') {
    sleepRecordSchema.set('autoIndex', false);
} else {
    sleepRecordSchema.set('autoIndex', true);
}

// methods

/*
 Find the sleep records of the user in the time range [from, to].
 */
sleepRecordSchema.statics.findByUserId = function (userid, from, to, callback) {
    this.find({
        userId: userid ,
        fallAsleepTime: {$gt: from, $lt: to}
    })
        .sort({ fallAsleepTime: -1 })
        .select({ fallAsleepTime: 1, wakeupTime: 1 })
        .exec(callback);
}

var SleepRecord = mongoose.model('SleepRecord', sleepRecordSchema);

module.exports = SleepRecord;