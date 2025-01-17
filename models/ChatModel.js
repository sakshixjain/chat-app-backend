const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
   sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    message:{
        type:String,
        required:true,

    }
   
    
},{timeStamp:true},);
module.exports = mongoose.model("Chat",ChatSchema);