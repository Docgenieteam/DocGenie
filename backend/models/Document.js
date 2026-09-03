const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    // =====================================================
    // OWNER
    // =====================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // DOCUMENT INFORMATION
    // =====================================================

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

    expiry: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // =====================================================
    // FILE INFORMATION
    // =====================================================

    originalFileName: {
      type: String,
      default: "",
    },

    storageKey: {
      type: String,
      default: "",
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
