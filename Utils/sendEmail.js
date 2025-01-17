const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log('Ready to send emails');
    } catch (error) {
        console.error('SMTP Connection Error:', error);
        throw new Error('Email service configuration error');
    }

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Password Reset'}" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Send Email Error:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;