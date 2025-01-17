const conversation = require("../models/Conversation");
const user = require('../models/userModel');
const mongoose = require('mongoose');

const messagemodel = require('../models/Messages');

const createConvo = async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
  
      // Check if the conversation already exists
      const existingConvo = await conversation.findOne({
        members: { $all: [senderId, receiverId] }
      });
  
      if (existingConvo) {
        return res.status(200).json({ message: 'Conversation already exists', conversation: existingConvo });
      }
  
    //   create a new one
    if(senderId!="" && receiverId!=''){
      const convo = new conversation({ members: [senderId, receiverId] });
      await convo.save();
      return res.status(200).json({ message: 'Conversation created successfully', conversation: convo });
    }
    else{
        return res.status(400).json({
            message:"ids are required"
        });
    }
  
    } catch (error) {
      res.status(500).send('Server error');
      console.error(error);
    }
  };
  


const getconvo = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId to ensure it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const convo = await conversation.find({ members: { $in: [userId] } });

        const convoadata = await Promise.all(convo.map(async (conversation) => {
            const reciverID = conversation.members.find((members) => members != userId);

            // Validate reciverID to ensure it's a valid ObjectId before querying the user
            if (!mongoose.Types.ObjectId.isValid(reciverID)) {
                return null; // You could handle this differently, depending on your needs
            }
            console.log("reciver-id=>",reciverID);
            const users = await user.findById(reciverID);
            return {users:{email:users.email,name:users.name,id:users._id},conversation_id:conversation._id}
        }));

        // Filter out any null values that may have resulted from invalid reciverIDs
        const validConvoadata = convoadata.filter(convo => convo !== null);

        res.status(200).json(validConvoadata);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while fetching conversations" });
    }
}



const saveMessages =(req,res)=>{
    try{
const {sender_id,conversation_id,message,reciver_id=''}=req.body;
if(!sender_id || !message){
    return  res.status(400).json({
        message:"all filed are required"
    });
}
if(!conversation_id && reciver_id){
    const newconversation = new conversation({members:[sender_id,reciver_id]});
    newconversation.save();

    const newmessage = new messagemodel({conversation_id:newconversation._id,sender_id,message});
    newmessage.save();
    return res.status(200).json({
        messsage:"message sent successfully"
    });
}
else{
    const message_data = new messagemodel({ conversation_id,sender_id,message});
    message_data.save();
    res.status(200).send('message saved sucessfully');
}


    }catch(error){
        console.log(error);
    }

}
const getmessages = async (req, res) => {
    try {
        const conversation_id = req.params.conversationid;

        if (!conversation_id) {
            return res.status(200).json({
                data: [],
                message: "Start chatting now"
            });
        }

        const messages = await messagemodel.find({ conversation_id: conversation_id });

        // Use Promise.all to resolve all user data promises concurrently
        const messageUserdata = await Promise.all(messages.map(async (message) => {
            const User = await user.findById(message.sender_id);
            return {
                user: {
                    id:User._id,
                    name: User.name,
                    email: User.email
                },
                message: message.message
            };
        }));

        res.status(200).json(messageUserdata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving messages" });
    }
};

const getusers = async (req, res) => {
    try {
    //   console.log("Fetching users...");
      const users = await user.find();
    //   console.log(users._id);
      const userdata = Promise.all(users.map((user)=>{
        return {users:{email:user.email,name:user.name},user_id:user._id};
      })

      )
      res.status(200).json(
       await userdata
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message, 
      });
    }
  };
  


module.exports ={
    createConvo,
    getconvo,
    saveMessages,
    getusers,
    getmessages,
};