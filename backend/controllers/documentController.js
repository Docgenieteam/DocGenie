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
// CREATE DOCUMENT
// =====================================================

const createDocument = async (req, res) => {
  try {
    const { name, category, date, icon, color, expiry, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Document name is required.",
      });
    }

    const document = await Document.create({
      // IMPORTANT:
      // Never take userId from frontend.
      // Get it from authenticated user.
      userId: req.user._id,

      name,
      category: category || "Other",

      date: date || "",

      icon: icon || "document",

      color: color || "blue",

      expiry: expiry || "",

      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Document added successfully.",
      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create document.",
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

      // VERY IMPORTANT
      // User can only access
      // their own document.
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

      // IMPORTANT:
      // Cannot delete another user's document.
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
