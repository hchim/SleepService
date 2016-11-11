var mongoose = require("mongoose");
var conf = require("../config");

var babyInfoSchema = mongoose.Schema({
    userId: String,
    name: String,
    birtyday: Date,
    gender: String,
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