const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const {
  sendOTP,
  verifyOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
} = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/send-phone-otp", sendPhoneOTP);

router.post("/verify-phone-otp", verifyPhoneOTP);
// =====================================================
// CREATE USER ACCOUNT
// =====================================================

router.post("/register", async (req, res) => {
  try {
    const { name, age, phone, email, password } = req.body;

    // Check required fields
    if (!name || !age || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      age,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,

      // Set true because this route is called
      // after email verification
      emailVerified: true,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.json({
      success: true,
      message: "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});

module.exports = router;
