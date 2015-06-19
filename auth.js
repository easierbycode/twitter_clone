
var passport      =  require( 'passport'),
    LocalStrategy = require('passport-local').Strategy,
    users         = require('./fixtures').users,
    _             = require('lodash');


// receives as arguments the username and password of the user that attempts authentication and checks their credentials
function verify( username, password, done ) {

  // the id field from the user objects will play the role of username
  var user = _.find( users, 'id', username );

  if ( user ) {
    if ( password === user.password ) return done( null, user );

    // user was found but password doesn’t match
    return done( null, false, { message:'Incorrect password.' } );
  }

  done( null, false, { message:'Incorrect username.' } );
}

passport.use( new LocalStrategy( verify ) );


passport.serializeUser( function( user, done ) {
  done( null, user.id );
});


passport.deserializeUser( function( id, done) {
  var user  = _.find( users, 'id', id ) || false;
      err   = null;

  done( err, user );
});


module.exports = passport;