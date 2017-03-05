var mongoose = require("mongoose");
var conf = require("../config");

var babyInfoSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    birthday: String,
    gender: Number,
});

// indexes

babyInfoSchema.index({ userId: 1});

if (conf.get("env") === 'production') {
    babyInfoSchema.set('autoIndex', false);
} else {
    babyInfoSchema.set('autoIndex', true);
}

// methods

var BabyInfo = mongoose.model('BabyInfo', babyInfoSchema);

module.exports = BabyInfo;