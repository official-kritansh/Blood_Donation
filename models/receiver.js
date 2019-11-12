var mongoose =require("mongoose"),
    passportLocalMongoose =require("passport-local-mongoose");


var receiverSchema =new mongoose.Schema({
    user:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    rbgp:String,
    mobile:Number,
    valid:Date,
    start:Date,
    description:String


});





module.exports =mongoose.model("Receiver",receiverSchema);