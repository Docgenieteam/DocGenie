const crypto = require("crypto");
const path = require("path");

const Document = require("../models/Document");
const { supabase, bucketName } = require("../config/supabase");

// GET ALL DOCUMENTS
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

// CREATE / UPLOAD DOCUMENT
const createDocument = async (req, res) => {
  let storageKey = null;

  try {
    const { name, category, date, icon, color, expiry, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Create a unique filename
    const extension = path.extname(req.file.originalname).toLowerCase();

    const uniqueFileName = `${crypto.randomUUID()}${extension}`;

    // Store files inside a folder for each user
    storageKey = `${req.user._id}/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageKey, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Failed to upload file to Supabase Storage",
      });
    }

    // Save document metadata to MongoDB
    const document = await Document.create({
      userId: req.user._id,

      name: name?.trim() || req.file.originalname,

      category: category?.trim() || "Other",

      date: date || new Date().toISOString(),

      icon: icon || "document",

      color: color || "blue",

      expiry: expiry || "",

      description: description?.trim() || "",

      originalFileName: req.file.originalname,

      storageKey,

      storageProvider: "supabase",

      fileType: req.file.mimetype,

      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    // If MongoDB save fails after Supabase upload,
    // remove the uploaded file from Supabase.
    if (storageKey) {
      try {
        await supabase.storage.from(bucketName).remove([storageKey]);
      } catch (cleanupError) {
        console.error("Supabase cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create document",
    });
  }
};

// GET SINGLE DOCUMENT
const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
};

// GET SIGNED FILE URL
const getDocumentFileUrl = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.storageKey) {
      return res.status(404).json({
        success: false,
        message: "File is not available",
      });
    }

    if (document.storageProvider !== "supabase") {
      return res.status(400).json({
        success: false,
        message: "Unsupported storage provider",
      });
    }

    // Generate a temporary signed URL.
    // The URL will remain valid for 1 hour.
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(document.storageKey, 60 * 60);

    if (error) {
      console.error("Signed URL error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to generate file URL",
      });
    }

    res.json({
      success: true,
      url: data.signedUrl,
      fileName: document.originalFileName,
      fileType: document.fileType,
    });
  } catch (error) {
    console.error("Get document file URL error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to access document file",
    });
  }
};

// DELETE DOCUMENT
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete actual file from Supabase
    if (document.storageKey && document.storageProvider === "supabase") {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([document.storageKey]);

      if (storageError) {
        console.error("Supabase delete error:", storageError);

        return res.status(500).json({
          success: false,
          message: "Failed to delete file from storage",
        });
      }
    }

    // Delete metadata from MongoDB
    await Document.deleteOne({
      _id: document._id,
    });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getDocument,
  getDocumentFileUrl,
  deleteDocument,
};
