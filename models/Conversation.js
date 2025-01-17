const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members:{
        type:Array,
        required:true,
    },
},{timeStamp:true});

module.exports = mongoose.model("conversation",ConversationSchema);