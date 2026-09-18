const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
      trim: true,
    },

    date: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "document",
    },

    color: {
      type: String,
      default: "blue",
    },

    // =====================================================
    // DOCUMENT EXPIRY DATE
    // =====================================================

    expiry: {
      type: String,
      default: "",
    },

    // =====================================================
    // EXPIRY NOTIFICATIONS ALREADY SENT
    // =====================================================
    //
    // Possible values:
    // "30"       = 30 days before expiry
    // "7"        = 7 days before expiry
    // "1"        = 1 day before expiry
    // "0"        = expires today
    //
    // This prevents the same notification from being
    // sent repeatedly.
    // =====================================================

    expiryNotificationsSent: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
    },

    originalFileName: {
      type: String,
      default: "",
    },

    storageKey: {
      type: String,
      default: "",
    },

    storageProvider: {
      type: String,
      default: "supabase",
    },

    fileType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Document", documentSchema);
