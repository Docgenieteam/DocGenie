const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =====================================================
    // PASSWORD
    // Password is stored as a bcrypt hash.
    // =====================================================

    password: {
      type: String,
      required: true,
    },

    // =====================================================
    // EMAIL VERIFICATION
    // =====================================================

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // FIREBASE CLOUD MESSAGING TOKENS
    //
    // A user can have multiple devices:
    // - Laptop
    // - Mobile phone
    // - Tablet
    //
    // $addToSet is used in notificationController.js
    // so duplicate tokens will not be stored.
    // =====================================================

    fcmTokens: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
