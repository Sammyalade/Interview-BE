const nodemailer = require('nodemailer');

// Create a transporter object using Gmail SMTP details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'developer@awarri.com',
        pass: 'jevn xdrl egpc vhyn',
    },
});

// Define email options
const mailOptions = {
    from: 'developer@awarri.com',
    to: 'kunkkykukky@gmail.com',
    subject: 'Subject of the Email',
    text: 'Body of the email.',
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
