
var nconf           = require('nconf');
    //env             = process.env.NODE_ENV || 'development',
    //configFilePath  = __dirname + '/config-' + env + '.json';


nconf.env()
  .file( { file: __dirname + '/config-' + nconf.get('NODE_ENV') + '.json' } );


module.exports = nconf;