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

    // Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Create file extension
    const extension = path.extname(req.file.originalname).toLowerCase();

    // Create unique filename
    const uniqueFileName = `${crypto.randomUUID()}${extension}`;

    // Store file inside a folder for the logged-in user
    storageKey = `${req.user._id}/${uniqueFileName}`;

    console.log("Uploading file to Supabase...");
    console.log("Bucket:", bucketName);
    console.log("Storage key:", storageKey);
    console.log("Original filename:", req.file.originalname);
    console.log("File type:", req.file.mimetype);
    console.log("File size:", req.file.size);

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageKey, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", {
        message: uploadError.message,
        name: uploadError.name,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
      });

      return res.status(500).json({
        success: false,
        message:
          uploadError.message || "Failed to upload file to Supabase Storage",
      });
    }

    console.log("File uploaded successfully to Supabase.");

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

    console.log("Document metadata saved to MongoDB.");

    return res.status(201).json({
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
        const { error: cleanupError } = await supabase.storage
          .from(bucketName)
          .remove([storageKey]);

        if (cleanupError) {
          console.error("Supabase cleanup error:", cleanupError);
        }
      } catch (cleanupError) {
        console.error("Supabase cleanup exception:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create document",
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

    return res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
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

    console.log("Generating Supabase signed URL...");
    console.log("Bucket:", bucketName);
    console.log("Storage key:", document.storageKey);

    // Generate temporary signed URL.
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(document.storageKey, 60 * 60);

    if (error) {
      console.error("Signed URL error:", {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        error: error.error,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to generate file URL",
      });
    }

    if (!data || !data.signedUrl) {
      console.error("Supabase returned no signed URL:", data);

      return res.status(500).json({
        success: false,
        message: "Supabase did not return a file URL",
      });
    }

    return res.json({
      success: true,
      url: data.signedUrl,
      fileName: document.originalFileName,
      fileType: document.fileType,
    });
  } catch (error) {
    console.error("Get document file URL error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to access document file",
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

    return res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
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
