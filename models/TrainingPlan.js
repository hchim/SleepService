var mongoose = require("mongoose");
var conf = require("../config");

var schema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: true
    },
    firstWeekTime: {
        sootheTime: Number,
        firstCriedOut: Number,
        secondCriedOut: Number,
        followingCriedOut: Number
    },
    secondWeekTime: {
        sootheTime: Number,
        firstCriedOut: Number,
        secondCriedOut: Number,
        followingCriedOut: Number
    },
    followingWeekTime: {
        sootheTime: Number,
        firstCriedOut: Number,
        secondCriedOut: Number,
        followingCriedOut: Number
    }
});

// indexes

schema.index({ userId: 1});

if (conf.get("env") === 'production') {
    schema.set('autoIndex', false);
} else {
    schema.set('autoIndex', true);
}

var TrainingPlan = mongoose.model('TrainingPlan', schema);

module.exports = TrainingPlan;