const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "605b5fdba7344b",
      pass: "6fd51dc43da128"
    }
  });

  const message = {
    from: '"Libamarket Support" <support@libamarket.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;

