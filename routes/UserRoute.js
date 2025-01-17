const express = require("express");
const router = express.Router();
//middleware import 
const {isLogin,isLogout} = require('../middlewares/auth');
// import model 
const {loadUser,register,login,logout, forgetPassword, resetPassword} = require('../controllers/userController');

//conversation route
const {createConvo,getconvo,saveMessages,getmessages,getusers} = require('../controllers/Chats');
console.log(getusers);

router.post('/register',register );
router.post('/login',login );
router.post('/logout/:userId',logout );
router.post('/dashboard',loadUser);
router.post('/forget-password',forgetPassword);
router.post('/reset-password',resetPassword);

router.post('/create-conversation',createConvo);
router.get('/get-conversation/:userId',getconvo);
router.post('/save-message/',saveMessages);
router.get('/get-message/:conversationid?',getmessages);
router.get('/get-users',getusers);


module.exports = router;
