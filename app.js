const {Server} = require('socket.io');
const express = require("express");
require('dotenv').config();



const bodyParser = require('body-parser');

const db = require('./Config/DbConfig');
const cors = require('cors');
const UserRoute = require("./routes/UserRoute");

const app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));




// fix cors issue 
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL if different
    credentials: true  // Allow credentials such as cookies to be sent
}));

const { createServer, get } = require('node:http');
const { disconnect } = require('node:process');
const userModel = require('./models/userModel');


// Configure session middleware
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL})
// }));


// creating server here with cors config
const server = createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true,

    }
});  




// namespace 
const usp = io.of('/user-namespace'); 

let users = [];
usp.on('connection',async function(socket){
    console.log(socket.id,"connnected");

    socket.on('adduser',(userid)=>{
        const isuserexist = users.find(user=>user.userid===userid);
        if(!isuserexist){
        const user = ({userid,socketId:socket.id});
        users.push(user);
        usp.emit('getUser',users);
        }
    });


    //send messsge
    socket.on('sendMessage', async ({ sender_id, conversation_id, message, reciver_id }) => {
        const receiver = users.find(user => user.userid === reciver_id);
        let sender = users.find(user => user.userid === sender_id);
        
        if (!sender) {
            console.error(`Sender with ID ${sender_id} not found in users array`);
            return; // Early exit, or you could handle re-adding the user here
        }
    
        const user = await userModel.findById(sender_id);
        
        if (receiver) {
            usp.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                sender_id,
                message,
                conversation_id,
                reciver_id,
                user: { id: user._id, name: user.name, email: user.email }
            });
        } else {
            usp.to(sender.socketId).emit('getMessage', {
                sender_id,
                message,
                conversation_id,
                reciver_id,
                user: { id: user._id, name: user.name, email: user.email }
            });
        }
    });
    





 
    socket.on('disconnect',async function(){
        console.log(socket.id,"disconnected");
        users = users.filter(user => user.socketId !== socket.id);
        usp.emit('getUser', users);
    
    })

    
});



// io.on("connection",(socket)=>{
// // console.log("user connceted",socket.id);
// connectedClients.push(socket.id);
// io.emit('clients',connectedClients);
// // socket.emit("welcome",`welcome to the chat app ${socket.id}`);
// socket.on("disconnect",()=>{
//     connectedClients = connectedClients.filter(id => id !== socket.id);
//     io.emit('clients', connectedClients); // Emit the updated clients list to all clients
//     // console.log("User disconnected",socket.id);
   
// })

// socket.on('msg',(data)=>{
// console.log(data);
// socket.to(data.roomID).emit('recived-msg',data);
// });



// })






// app.listen create a new instance of server and we dont need a new one we use previous one created with server
// app.listen('3000',()=>{
//     console.log("running");

// })


app.use('/api/',UserRoute);

server.listen('3000',()=>{
    console.log("running");

})

app.use('/good',(req,res)=>{
    res.send('hello');
})

// data base conncetion  is here 
db();



