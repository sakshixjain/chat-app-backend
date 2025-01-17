// exports.resetPasswordTemplate = (resetUrl, userName) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         .email-container {
//           max-width: 600px;
//           margin: 0 auto;
//           font-family: Arial, sans-serif;
//           padding: 20px;
//         }
//         .button {
//           background-color: #4F46E5;
//           color: white;
//           padding: 12px 24px;
//           text-decoration: none;
//           border-radius: 4px;
//           display: inline-block;
//           margin: 20px 0;
//         }
//         .footer {
//           margin-top: 20px;
//           font-size: 12px;
//           color: #666;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="email-container">
//         <h2>Password Reset Request</h2>
//         <p>Hello${userName ? ` ${userName}` : ''},</p>
//         <p>You recently requested to reset your password. Click the button below to reset it:</p>
        
//         <a href="${resetUrl}" class="button">Reset Password</a>
        
//         <p>If you didn't request this, you can safely ignore this email.</p>
        
//         <p>For security reasons, this link will expire in 10 minutes.</p>
        
//         <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
//         <p>${resetUrl}</p>
        
//         <div class="footer">
//           <p>This is an automated email. Please do not reply to this email.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }; 