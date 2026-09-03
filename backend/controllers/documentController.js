const fs = require("fs");
const path = require("path");

const Document = require("../models/Document");

// =====================================================
// GET USER DOCUMENTS
// =====================================================

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load documents.",
    });
  }
};

// =====================================================
// CREATE / UPLOAD DOCUMENT
// =====================================================

const createDocument = async (req, res) => {
  try {
    const { name, category, date, icon, color, expiry, description } = req.body;

    // ---------------------------------------------------
    // CHECK DOCUMENT NAME
    // ---------------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document name is required.",
      });
    }

    // ---------------------------------------------------
    // CHECK FILE
    // ---------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required.",
      });
    }

    // ---------------------------------------------------
    // CREATE DOCUMENT
    // ---------------------------------------------------

    const document = await Document.create({
      userId: req.user._id,

      name: name.trim(),

      category: category || "Other",

      date:
        date ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

      icon: icon || "document",

      color: color || "blue",

      expiry: expiry || "",

      description: description?.trim() || "",

      // -------------------------------------------------
      // FILE INFORMATION
      // -------------------------------------------------

      originalFileName: req.file.originalname,

      storageKey: req.file.filename,

      fileType: req.file.mimetype,

      fileSize: req.file.size,
    });

    return res.status(201).json({
      success: true,

      message: "Document uploaded successfully.",

      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    // ---------------------------------------------------
    // DELETE UPLOADED FILE IF DATABASE SAVE FAILED
    // ---------------------------------------------------

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("Unable to delete uploaded file:", deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload document.",
    });
  }
};

// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load document.",
    });
  }
};

// =====================================================
// DELETE DOCUMENT
// =====================================================

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // ---------------------------------------------------
    // DELETE PHYSICAL FILE
    // ---------------------------------------------------

    if (document.storageKey) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        document.storageKey,
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete document.",
    });
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getDocument,
  deleteDocument,
};
