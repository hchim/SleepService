/*
    Timezone Date.
 */
require("string-format-js");

//constructor
var TZDate = function(datestr) {
    // 2013-11-18T11:55:00-05:00
    var strs = datestr.split('T');
    var datetimeStrs = strs[0].split('-');
    this.year = parseInt(datetimeStrs[0]);
    this.month = parseInt(datetimeStrs[1]);
    this.date = parseInt(datetimeStrs[2]);

    if (strs[1].indexOf('-') > 0) {
        strs = strs[1].split('-');
        var zonestr = strs[1].split(":");
        this.offset = parseInt(zonestr[0]) * -1;
    } else {
        strs = strs[1].split('+');
        var zonestr = strs[1].split(":");
        this.offset = parseInt(zonestr[0]);
    }

    strs = strs[0].split(':');
    this.hour = parseInt(strs[0]);
    this.minute = parseInt(strs[1]);
    this.second = parseInt(strs[2]);
}

// class methods
TZDate.prototype.getTime = function() {
    var date_str = this.toString();
    return new Date(date_str);
};

const date_format = '%d-%02d-%02dT%02d:%02d:%02d%s%02d:%02d';

TZDate.prototype.toString = function() {
    return date_format.format(
        this.year, this.month, this.date,
        this.hour, this.minute, this.second,
        this.offset < 0 ? '-' : '+',
        Math.abs(this.offset), 0
    );
};

TZDate.prototype.sameDay = function(tz_date) {
    return tz_date.year == this.year && tz_date.month == this.month && tz_date.date == this.date;
};

// export the class
module.exports = TZDate;
