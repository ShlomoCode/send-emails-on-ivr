const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = async (address, subject, body) => {
    return transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: address,
        subject: subject,
        text: body
    });
};