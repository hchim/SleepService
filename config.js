var convict = require('convict');
var utils = require('servicecommonutils')
var fs = require('fs');

// Load common configs of all the services
var conf = convict(utils.commonConfigs());
// Load common configs of this service
conf.loadFile('./config/common.json')
// Load environment dependent configuration
var config_path = './config/' + conf.get('env');
var files = fs.readdirSync(config_path);

files.forEach(function (file) {
    var path = config_path + "/" + file;
    conf.loadFile(path);
});

// Perform validation
conf.validate({strict: true});

module.exports = conf;