const nodemailer = require('nodemailer');

const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'eraj4671@gmail.com',
    pass: 'thsl jtgh acdo jylj'
  }
});

    const mailOptions = {
      from: 'eraj4671@gmail.com',
      to: to,
      subject: 'Your OTP Code',
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP is valid for 60 seconds.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("📧 OTP sent to:", to);

  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

module.exports = sendOTPEmail;