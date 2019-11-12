var mongoose =require("mongoose"),
    passportLocalMongoose =require("passport-local-mongoose");


var donarSchema =new mongoose.Schema({
    user:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    bgp:String
});





module.exports =mongoose.model("Donar",donarSchema);