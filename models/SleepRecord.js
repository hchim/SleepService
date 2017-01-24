var mongoose = require("mongoose");
var conf = require("../config");

var sleepRecordSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    fallAsleepTime: {
        type: Date,
        required: true
    },
    wakeupTime: {
        type: Date,
        required: true
    },
    timezone: {
        type: String,
        required: true
    }
});

// indexes

sleepRecordSchema.index({ userId: 1, fallAsleepTime: -1, wakeupTime: -1 });

if (conf.get("env") === 'production') {
    sleepRecordSchema.set('autoIndex', false);
} else {
    sleepRecordSchema.set('autoIndex', true);
}

var SleepRecord = mongoose.model('SleepRecord', sleepRecordSchema);

module.exports = SleepRecord;