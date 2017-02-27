var mongoose = require("mongoose");
var conf = require("../config");

var schema = mongoose.Schema({
    planId: {
        type: String,
        required: true
    },
    elapsedTime: {
        type: Number,
        required: true
    },
    criedOutTimes: {
        type: Number,
        required: true
    },
    sootheTimes: {
        type: Number,
        required: true
    },
    trainingTime: {
        type: Date,
        default: Date.now()
    }
});

// indexes

schema.index({ planId: 1, trainingTime: 1});

if (conf.get("env") === 'production') {
    schema.set('autoIndex', false);
} else {
    schema.set('autoIndex', true);
}

var TrainingRecord = mongoose.model('TrainingRecord', schema);

module.exports = TrainingRecord;