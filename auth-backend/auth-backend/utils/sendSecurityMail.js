const nodemailer = require('nodemailer');

const sendSecurityMail = async (to, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'eraj4671@gmail.com',
        pass: 'thsl jtgh acdo jylj'
      }
    });

    await transporter.sendMail({
      from: 'eraj4671@gmail.com',
      to: to,
      subject: '⚠ Security Alert',
      html: `
        <h2>Security Alert</h2>
        <p>${message}</p>
        <p>If this was not you, secure your account immediately.</p>
      `
    });

    console.log('Security mail sent');

  } catch (error) {
    console.log('Mail error:', error.message);
  }
};

module.exports = sendSecurityMail;