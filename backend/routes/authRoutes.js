const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// =====================================================
// FIREBASE ADMIN
// =====================================================

// This loads your Firebase Admin configuration
// and initializes Firebase Admin.
require("../config/firebaseAuth");

const { getAuth } = require("firebase-admin/auth");

// =====================================================
// AUTH CONTROLLERS
// =====================================================

const {
  sendOTP,
  verifyOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
} = require("../controllers/authController");

const router = express.Router();

// =====================================================
// EMAIL OTP
// =====================================================

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

// =====================================================
// PHONE OTP
// =====================================================

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      age,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,

      // Account was created after email verification
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
// NORMAL EMAIL / PASSWORD LOGIN
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

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create DocGenie JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      success: true,

      message: "Login successful.",

      token,

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

// =====================================================
// GOOGLE LOGIN
// =====================================================

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    console.log("Google backend route received token:", !!idToken);

    // Check Firebase token
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
    }

    // =================================================
    // VERIFY FIREBASE ID TOKEN
    // =================================================

    const decodedToken = await getAuth().verifyIdToken(idToken);

    console.log("Firebase token verified successfully.");

    const { uid, email, name, email_verified } = decodedToken;

    // Google account must have an email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have an email.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =================================================
    // FIND EXISTING USER
    // =================================================

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // =================================================
    // CREATE USER IF IT DOES NOT EXIST
    // =================================================

    if (!user) {
      console.log("Creating new Google user:", normalizedEmail);

      const generatedPassword = crypto.randomBytes(32).toString("hex");

      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      user = new User({
        name: name || normalizedEmail.split("@")[0],

        age: "N/A",

        phone: `google-${uid}`,

        email: normalizedEmail,

        password: hashedPassword,

        emailVerified: email_verified === true,
      });

      await user.save();

      console.log("Google user created successfully:", normalizedEmail);
    } else {
      // =================================================
      // EXISTING USER
      // =================================================

      console.log("Existing user logged in with Google:", normalizedEmail);

      // Google has verified the email
      if (!user.emailVerified) {
        user.emailVerified = true;

        await user.save();
      }
    }

    // =================================================
    // CREATE DOCGENIE JWT
    // =================================================

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // =================================================
    // SEND RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message: "Google login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Unable to authenticate with Google.",
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
