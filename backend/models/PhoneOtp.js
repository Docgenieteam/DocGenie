const mongoose = require("mongoose");

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PhoneOtp", phoneOtpSchema);
