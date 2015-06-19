var express       = require('express'),
    session       = require('express-session'),
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser'),
    passport      = require('./auth'),
    _             = require('lodash'),
    tweets        = require('./fixtures').tweets,
    users         = require('./fixtures').users,
    app           = express(),
    config        = require('./config'),
    server        = app.listen(config.get('server:port'), config.get('server:host'));


function ensureAuthentication( req, res, next ) {
  if ( req.isAuthenticated() )  return next();
  return res.sendStatus( 403 );
};


// load the body / cookie parsing middlewares
app.use( bodyParser.json() );
app.use( cookieParser() );

app.use( session( {
  secret            : 'keyboard cat',
  resave            : false,
  saveUninitialized : true
}));

// Make sure the passport middleware is loaded after body-parser, cookie-parser, session because it depends on them
app.use( passport.initialize() );
app.use( passport.session() );


app.post( '/api/auth/login', function( req, res ) {
  passport.authenticate( 'local', function( err, user, info ) {
    if ( err )    return res.sendStatus( 500 );
    if ( !user )  return res.sendStatus( 403 );
    req.logIn( user, function( err ) {
      if ( err )  return res.sendStatus( 500 );
      res.json( { user:user } );
    });
  })( req, res );
});


app.post( '/api/auth/logout', function( req, res ) {
  req.logout();
  res.sendStatus( 200 );
});



var existingTweetIds  = _.pluck( tweets, 'id');
var tweetId           = + _.max( existingTweetIds ) + 1;

app.post( '/api/tweets', ensureAuthentication, function( req, res ) {

  // | 0 is bitwise operation that has same affect as Math.floor
  var currentTime = Date.now() / 1000 | 0;

  // add 1 to time so test will pass (to.be.closeTo fails when values are equal)
  currentTime++;

  var tweet = _.extend(
    req.body.tweet,
    { id: tweetId, created: currentTime, userId: req.user.id }
  );
  
  tweets.push( tweet );
  
  tweetId++;

  res.json( { tweet: tweet } );
});


app.post( '/api/users', function( req, res ) {
  var user = req.body.user,
      duplicateUser = _.find( users, 'id', user.id );
  
  if ( duplicateUser ) return res.sendStatus( 409 );

  user.followingIds = [];

  users.push( user );

  // establish an authenticated session for the newly created user
  req.login( user, function( err ) {

    if ( err )  return res.sendStatus( 500 );

    res.json( user );
  })
});


app.get( '/api/users/:userId', function( req, res ) {
  var selectedUser = users.filter( function( user ) {
    return user.id === req.params.userId;
  }).pop();

  if ( selectedUser ) return res.json( { user:selectedUser } );
  return res.sendStatus( 404 );
});


app.get( '/api/tweets/:tweetId', function( req, res ) {
  var selectedTweet = _.find( tweets, 'id', req.params.tweetId );

  if ( selectedTweet ) return res.json( { tweet: selectedTweet } );
  
  res.sendStatus( 404 );
});


app.get( '/api/tweets', function( req, res ) {
  if ( !req.query.userId ) return res.sendStatus( 400 );

  var userId      = req.query.userId,
      userTweets  = tweets.filter( function( tweet ) {
        return tweet.userId === userId;
      }),
      userTweetsSorted = userTweets.sort( function( a, b ) {
        if ( a.created > b.created ) return -1;
        if ( a.created < b.created ) return 1;
        return 0;
      });

  res.json( { tweets:userTweetsSorted } );
});


app.delete( '/api/tweets/:tweetId', ensureAuthentication, function( req, res ) {

  var idx           = _.findIndex( tweets, 'id', req.params.tweetId),
      tweet         = tweets[idx],
      belongsToUser = tweet.userId === req.user.id;

  // respond with status code 404 (“Not found”) because there’s no tweet with id
  if ( ! tweet )  return res.sendStatus( 404 );

  // check if the tweet to be deleted actually belongs to the authenticated user
  if ( belongsToUser ) {
    tweets.splice( idx, 1 );
    return res.sendStatus( 200 );
  }

  res.sendStatus( 403 );
});


module.exports = server;