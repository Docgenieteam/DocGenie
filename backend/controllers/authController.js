const PhoneOtp = require("../models/PhoneOtp");
const Otp = require("../models/Otp");
const crypto = require("crypto");

// Generate secure 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 10000).toString();
};

// ===============================
// SEND EMAIL OTP
// ===============================
const sendOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();

    // Remove any previous OTP for this email
    await Otp.deleteMany({
      identifier: email,
    });

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      identifier: email,
      otp,
      expiresAt,
    });

    // ===============================
    // SEND EMAIL USING BREVO API
    // ===============================
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME || "DocGenie",
          email: process.env.BREVO_FROM_EMAIL,
        },

        to: [
          {
            email: email,
          },
        ],

        subject: "DocGenie Verification OTP",

        textContent:
          `Your DocGenie verification OTP is ${otp}. ` +
          `This OTP is valid for 5 minutes.`,

        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
              <h2>DocGenie Email Verification</h2>

              <p>Your verification OTP is:</p>

              <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                padding: 15px;
                background: #f3f4f6;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
              ">
                ${otp}
              </div>

              <p>This OTP is valid for <strong>5 minutes</strong>.</p>

              <p>
                If you did not request this code, you can safely ignore this email.
              </p>

              <p>— DocGenie Team</p>
            </div>
          `,
      }),

      signal: AbortSignal.timeout(15000),
    });

    const brevoData = await brevoResponse.json();

    console.log("Brevo response:", brevoResponse.status, brevoData);

    if (!brevoResponse.ok) {
      console.error("Brevo email error:", brevoData);

      // Don't leave an OTP in the database if email failed
      await Otp.deleteMany({
        identifier: email,
      });

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP",
      });
    }

    console.log(`Email OTP sent successfully to ${email}`);

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

// ===============================
// VERIFY EMAIL OTP
// ===============================
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({
      identifier: email,
      otp: otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP is valid
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

// ===============================
// SEND PHONE OTP
// ===============================
const sendPhoneOTP = async (req, res) => {
  try {
    const phone = req.body.phone?.trim();

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

    console.log(`Phone OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Phone OTP generated",
      developmentOTP: otp,
    });
  } catch (error) {
    console.error("Send phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send phone OTP",
    });
  }
};

// ===============================
// VERIFY PHONE OTP
// ===============================
const verifyPhoneOTP = async (req, res) => {
  try {
    const phone = req.body.phone?.trim();
    const otp = req.body.otp?.trim();

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await PhoneOtp.findOne({
      phone,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
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

    await PhoneOtp.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    console.error("Verify phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify phone OTP",
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
};
