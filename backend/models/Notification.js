const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // DOCUMENT
    // =====================================================

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================

    type: {
      type: String,
      enum: ["90-days", "30-days", "7-days", "1-day", "expired"],
      required: true,
    },

    // =====================================================
    // MESSAGE
    // =====================================================

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // =====================================================
    // CHANNEL
    // =====================================================

    channel: {
      type: String,
      enum: ["fcm", "whatsapp"],
      required: true,
    },

    // =====================================================
    // STATUS
    // =====================================================

    sent: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
