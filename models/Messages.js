const mongoose = require('mongoose');

const message_schema  = new mongoose.Schema({
    conversation_id:{
        type:String,
        
    },
    sender_id:{
        type:String,
        
    },
    message:{
        type:String
        
    }
},{timeStamp:true});

module.exports = mongoose.model("message_schema",message_schema);