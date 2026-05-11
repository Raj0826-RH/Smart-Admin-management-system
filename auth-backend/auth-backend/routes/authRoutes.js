const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendSecurityMail = require('../utils/sendSecurityMail');
const User = require('../models/User');

const router = express.Router();

const otpStore = {};


// ================= SIGNUP FUNCTION =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully ✅",
      user: newUser
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
};


// ================= ROUTES =================
router.post('/signup', registerUser);
router.post('/register', registerUser);


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN REQUEST:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and Password are required"
      });
    }

    const user = await User.findOne({
      where: { email: email.trim() }
    });

    if (!user) {
      return res.status(400).json({
        msg: "Email not registered"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await sendSecurityMail(
        email,
        "Someone tried to login to your account with wrong password."
      );

      return res.status(400).json({
        msg: "Wrong password. Security alert sent to email."
      });
    }

    await sendSecurityMail(
      email,
      "Your account was logged in successfully."
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      msg: "Login successful ✅",
      token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      msg: "Server error",
      error: err.message
    });
  }
});


// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  try {
    const { contact } = req.body;

    if (!contact) {
      return res.status(400).json({
        msg: "Email is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[contact] = otp;

    await sendSecurityMail(
      contact,
      `Your OTP code is: <b>${otp}</b>`
    );

    res.json({
      success: true,
      msg: "OTP sent successfully"
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    res.status(500).json({
      msg: "OTP send failed"
    });
  }
});


// ================= VERIFY OTP =================
router.post('/verify-otp', (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({
        msg: "All fields required"
      });
    }

    if (otpStore[contact] === otp) {
      delete otpStore[contact];

      return res.json({
        success: true,
        msg: "OTP verified successfully ✅"
      });
    }

    return res.status(400).json({
      msg: "Invalid OTP"
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    res.status(500).json({
      msg: "OTP verification failed"
    });
  }
});


// ================= CHANGE PASSWORD =================
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      await sendSecurityMail(
        email,
        "Someone tried to change your password using wrong old password."
      );

      return res.status(400).json({
        msg: "Old password incorrect. Security alert sent to mail."
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedNewPassword
    });

    await sendSecurityMail(
      email,
      "Your password was changed successfully."
    );

    res.json({
      success: true,
      msg: "Password changed successfully ✅"
    });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      msg: "Password change failed"
    });
  }
});
// ================= FORGOT PASSWORD =================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Optional email notification
    await sendSecurityMail(
      email,
      'Password reset request received.'
    );

    res.json({
      success: true,
      message: 'Reset link sent successfully ✅'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Forgot password failed'
    });
  }
});

module.exports = router;