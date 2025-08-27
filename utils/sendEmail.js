const NodeMailer = require("nodemailer");

const sendEmails = async (options) => {
  const transporter = NodeMailer.createTransport({
    host: process.env.Email_HOST,
    port: process.env.Email_PORT,
    secure: process.env.Email_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmails;
