const PhoneOtp = require("../models/PhoneOtp");
const Otp = require("../models/Otp");
const crypto = require("crypto");

// Generate secure 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 10000).toString();
};

// =============================
// SEND EMAIL OTP
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

    const normalizedEmail = email.trim().toLowerCase();

    // Check Resend configuration
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error("RESEND_FROM_EMAIL is missing.");

      return res.status(500).json({
        success: false,
        message: "Email sender is not configured.",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete previous OTPs for this email
    await Otp.deleteMany({
      identifier: normalizedEmail,
    });

    // Save new OTP in MongoDB
    await Otp.create({
      identifier: normalizedEmail,
      otp,
      expiresAt,
    });

    // =====================================
    // SEND EMAIL USING RESEND API
    // =====================================

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [normalizedEmail],
        subject: "DocGenie Verification OTP",

        text: `Your DocGenie verification OTP is ${otp}. This OTP is valid for 5 minutes. Do not share this OTP with anyone.`,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h2 style="color: #123B63;">
              DocGenie Email Verification
            </h2>

            <p>
              Your DocGenie verification OTP is:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px;
              background: #f3f6f9;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <p>
              Please do not share this OTP with anyone.
            </p>

            <p>
              If you did not request this verification code, you can safely ignore this email.
            </p>

            <br />

            <p>
              Regards,<br />
              <strong>DocGenie Team</strong>
            </p>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const emailData = await emailResponse.json();

    // Resend returned an error
    if (!emailResponse.ok) {
      console.error("Resend email error:", emailData);

      // Remove OTP because email was not sent
      await Otp.deleteMany({
        identifier: normalizedEmail,
      });

      return res.status(500).json({
        success: false,
        message:
          emailData?.message || "Unable to send OTP email. Please try again.",
      });
    }

    console.log(
      `OTP email sent successfully to ${normalizedEmail}. Resend ID: ${emailData?.id || "unknown"}`,
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    // Clean up OTP if email sending failed
    try {
      if (req.body?.email) {
        await Otp.deleteMany({
          identifier: req.body.email.trim().toLowerCase(),
        });
      }
    } catch (cleanupError) {
      console.error("OTP cleanup error:", cleanupError);
    }

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

// =============================
// VERIFY EMAIL OTP
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

    const normalizedEmail = email.trim().toLowerCase();

    // Find OTP
    const otpRecord = await Otp.findOne({
      identifier: normalizedEmail,
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
    if (otpRecord.otp !== otp.toString()) {
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

    // Maximum attempts
    if (otpRecord.attempts >= 5) {
      await PhoneOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await PhoneOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check OTP
    if (otpRecord.otp !== otp.toString()) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP correct
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

// =============================
// EXPORT CONTROLLERS
// =============================

module.exports = {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendOTP,
  verifyOTP,
};
