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

var SleepRecord = mongoose.model('SleepRecord', sleepRecordSchema);

module.exports = SleepRecord;