const nodemailer = require("nodemailer");

  // Create a transporter object using Gmail SMTP details
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "developer@awarri.com",
    pass: "jevn xdrl egpc vhyn",
  },
  from: "developer@awarri.com",
});

// Define email options
const options = {
  from: "developer@awarri.com",
  to: "kunkkykukky@gmail.com",
  subject: "Subject of the Email",
  text: "Hello User.",
};

try {
    // Send the email
    const info = transporter.sendMail(options);
    console.log("Email sent:", info);
  } catch (error) {
    console.error("Error sending email:", error);
  }