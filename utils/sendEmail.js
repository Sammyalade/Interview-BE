const nodemailer = require("nodemailer");

// Create Email Transporter
const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "developer@awarri.com",
      pass: 'jevn xdrl egpc vhyn', // Use an App Password for enhanced security
    },
    from: "developer@awarri.com",
  });

  // Options for sending Email
  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(options);
    console.log("Email sent:", info);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
