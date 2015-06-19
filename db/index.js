
var mongoose  = require( 'mongoose' ),
    config    = require( __dirname + '/../config' ),
    conn      = mongoose.createConnection(  config.get( 'database:host' ),
                                            config.get( 'database:name' ),
                                            config.get( 'database:port' ) );

mongoose.model( 'Tweet', require('./schemas/tweet'), 'tweets' );
mongoose.model( 'User', require('./schemas/user'), 'users' );

// HACK: db.models is now db.base.models in Mongoose 4.x
conn.models   = conn.base.models;

// HACK: db.collections isn't populated in Mongoose 4.x
conn.on( 'open', function() {
  conn.collections  = {
    'tweets'  : conn.base.models.Tweet,
    'users'   : conn.base.models.User
  }
})


module.exports  = conn;