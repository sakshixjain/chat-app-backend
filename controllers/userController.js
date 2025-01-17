const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { resetPasswordTemplate } = require('../utils/emailTemplates');

const register = async (req, res) => {
  try {
    console.log(req.body);
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
    });
    await user.save();
    res.json({
      message: "Registered successfully",
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        isonline: user.isonline,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
};

const login = async (req, res,next) => {
  try {
    if(req.body.email!="" && req.body.password!=''){
      // fetching data from database
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
  

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    } else {
      const payload ={
        userid: user._id,
        email:user.email
      }

      const jwt_seceret = process.env.JWT_SECRET || 'THIS_JWT_SECRET';
      jwt.sign(payload,jwt_seceret,{expiresIn:84600},async (err,token)=>{
        await User.updateOne({_id:user._id},{
          $set:{token}
      })

      user.save();
      return res.status(200).json({
        user:{email:user.email,name:user.name,id:user._id},
        token:{token:token},
        message:"login sucess"
      });
    
      });
      
    }
   
  }
  else{
    res.status(400).json({
      message:"please enter the valid email and password",
      success:false,
    })
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
};

const logout = async (req, res) => {
  const userId = req.params.userId;
  if(!userId){
    return res.json({
      message:"id is not valid"
    })
  }
  else{
  await User.updateOne({ _id: userId }, { $set: { token: "" } });
  return res.json({
    message:"log out sucessfully"
  })
}

};





const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    
    await user.save();

    // Create reset URL - use FRONTEND_URL from env
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: resetPasswordTemplate(resetUrl, user.name),
        text: `Reset your password by visiting: ${resetUrl}` // Fallback plain text
      });

      res.status(200).json({
        message: 'Password reset link sent to your email'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Email send error:', error);
      return res.status(500).json({
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};








const loadUser = async (req, res) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.session.user._id } });

    if (allUsers.length > 0) {
      res.json({
        users: allUsers,
        message: "Users have been populated",
      });
    } else {
      res.json({
        users: [],
        message: "No other users found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while loading users" });
  }
};

// const resetPassword = async (req, res) => {
//   try {
//     const { token, newPassword, confirmPassword } = req.body;

//     if (confirmPassword !== newPassword) {
// 			return res.json({
// 				success: false,
// 				message: "Password and Confirm Password Does not Match",
// 			});
// 		}

//     // Get hashed token
//     const resetPasswordToken = crypto
//       .createHash('sha256')
//       .update(token)
//       .digest('hex');

//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired reset token'
//       });
//     }

//     // Set new password
//     const passwordHash = await bcrypt.hash(newPassword, 10);
//     user.password = passwordHash;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Password reset successful'
//     });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'An error occurred while resetting password'
//     });
//   }
// };


const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required"
      });
    }

    // Add password length validation
    if (newPassword.length < 8) { // Changed to 8 to match client validation
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Hash the received token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false, 
      message: 'An error occurred while resetting password'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  loadUser,
  forgetPassword,
  resetPassword
};
