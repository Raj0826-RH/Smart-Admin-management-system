const express = require('express');
const router = express.Router();
const OTP = require('../models/Otp');
const sendOTPEmail = require('../utils/sendMail');
// 🔥 Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  try {
    
    const { contact } = req.body;

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: "Email or phone required"
      });
    }

    // 🔒 Prevent spam (resend restriction)
    const existing = await OTP.findOne({ where: { contact } });

    if (existing && new Date() < existing.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Wait 30 seconds before requesting new OTP"
      });
    }

    const otp = generateOTP();
const expiresAt = new Date(Date.now() + 60 * 1000);

// 🔥 THIS LINE IS MUST
await sendOTPEmail(contact, otp);

await OTP.destroy({ where: { contact } });

await OTP.create({
  contact,
  otp,
  expiresAt
});

    console.log("🔥 OTP:", otp); // testing

    res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 60
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});


// ================= VERIFY OTP =================
router.post('/verify-otp', async (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({
        success: false,
        message: "Contact and OTP required"
      });
    }

    const record = await OTP.findOne({ where: { contact } });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    // ⏱ Expiry check
    if (new Date() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // ❌ Wrong OTP
    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // ✅ Success → delete OTP
    await OTP.destroy({ where: { contact } });

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
});

module.exports = router;