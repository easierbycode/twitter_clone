
var mongoose    = require( 'mongoose' ),
    Schema      = mongoose.Schema,
    tweetSchema = new Schema({
    userId        : String,
    created       : Number,
    text          : String
  });


module.exports = tweetSchema;