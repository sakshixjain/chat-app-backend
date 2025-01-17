const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    token:{
     type:String
    },
    isonline:{
        type:String,
       default:'0',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},{timeStamp:true},);
module.exports = mongoose.model("User",UserSchema);