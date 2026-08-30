const PhoneOtp = require("../models/PhoneOtp");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = require("../routes/authRoutes");

// Generate secure 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 10000).toString();
};

// =============================
// SEND OTP
// =============================

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete previous OTP
    await Otp.deleteMany({
      identifier: email,
    });

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP in MongoDB
    await Otp.create({
      identifier: email,
      otp,
      expiresAt,
    });

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "DocGenie Verification OTP",

      text: `Your DocGenie verification OTP is ${otp}. This OTP is valid for 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

// =============================
// VERIFY OTP
// =============================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find OTP
    const otpRecord = await Otp.findOne({
      identifier: email,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    // Maximum attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP correct
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// =============================
// SEND PHONE OTP
// =============================

const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const otp = generateOTP();

    await PhoneOtp.deleteMany({
      phone,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PhoneOtp.create({
      phone,
      otp,
      expiresAt,
    });

    // Development mode:
    // No paid SMS service is used.
    console.log(`Phone OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Phone OTP generated successfully",
      developmentOTP: otp,
    });
  } catch (error) {
    console.error("Send phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate phone OTP",
    });
  }
};

// =============================
// VERIFY PHONE OTP
// =============================

const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await PhoneOtp.findOne({
      phone,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    if (otpRecord.attempts >= 5) {
      await PhoneOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await PhoneOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await PhoneOtp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Phone OTP verification failed",
    });
  }
};
module.exports = {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendOTP,
  verifyOTP,
};
