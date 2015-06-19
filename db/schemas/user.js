
var mongoose    = require( 'mongoose' ),
    Schema      = mongoose.Schema,
    userSchema  = new Schema({
      id            : { type:String, unique:true },
      name          : String,
      email         : { type:String, unique:true },
      password      : String,
      followingIds  : { type:[String], default:[] }
    });


module.exports = userSchema;