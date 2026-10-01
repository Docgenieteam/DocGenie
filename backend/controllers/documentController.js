const crypto = require("crypto");
const path = require("path");

const Document = require("../models/Document");
const { supabase, bucketName } = require("../config/supabase");

// =====================================================
// OCR SERVICE
// =====================================================

const { extractTextFromBuffer } = require("../services/ocrService");

// =====================================================
// DOCUMENT DETECTION
// =====================================================

const {
  detectDocumentType,
  detectExpiryDate,
} = require("../services/documentDetectionService");

// =====================================================
// GET ALL DOCUMENTS
// =====================================================

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

// =====================================================
// OCR SCAN DOCUMENT
//
// IMPORTANT:
// This does NOT save the document.
// It only scans the selected file and returns
// detected information to the frontend.
// =====================================================

const scanDocument = async (req, res) => {
  try {
    // -------------------------------------------------
    // CHECK FILE
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file to scan",
      });
    }

    console.log("==========================================");

    console.log("OCR scan started:", req.file.originalname);

    console.log("File type:", req.file.mimetype);

    console.log("File size:", req.file.size);

    // -------------------------------------------------
    // RUN OCR
    // -------------------------------------------------

    const extractedText = await extractTextFromBuffer(
      req.file.buffer,
      req.file.mimetype,
    );

    console.log("OCR text extracted successfully");

    console.log("Extracted text length:", extractedText?.length || 0);

    // -------------------------------------------------
    // DETECT DOCUMENT TYPE
    // -------------------------------------------------

    const documentType = detectDocumentType(extractedText || "");

    console.log("Detected document type:", documentType);

    // -------------------------------------------------
    // DETECT EXPIRY DATE
    // -------------------------------------------------

    const expiryDate = detectExpiryDate(extractedText || "");

    console.log("Detected expiry date:", expiryDate || "Not detected");

    console.log("OCR scan completed");

    console.log("==========================================");

    // -------------------------------------------------
    // SEND RESULT TO FRONTEND
    // -------------------------------------------------

    return res.json({
      success: true,

      scan: {
        documentType,

        expiryDate,

        extractedText,

        originalFileName: req.file.originalname,

        fileType: req.file.mimetype,

        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error("==========================================");

    console.error("OCR SCAN ERROR:");

    console.error(error);

    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: "Unable to scan document",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE / UPLOAD DOCUMENT
//
// This is the FINAL upload.
// OCR happens separately through /scan.
// =====================================================

const createDocument = async (req, res) => {
  let storageKey = null;

  try {
    const { name, category, date, icon, color, expiry, description } = req.body;

    // -------------------------------------------------
    // CHECK FILE
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // -------------------------------------------------
    // CREATE UNIQUE FILE NAME
    // -------------------------------------------------

    const extension = path.extname(req.file.originalname).toLowerCase();

    const uniqueFileName = `${crypto.randomUUID()}${extension}`;

    // -------------------------------------------------
    // USER-SPECIFIC STORAGE PATH
    // -------------------------------------------------

    storageKey = `${req.user._id}/${uniqueFileName}`;

    // -------------------------------------------------
    // UPLOAD TO SUPABASE
    // -------------------------------------------------

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

    // -------------------------------------------------
    // SAVE DOCUMENT TO MONGODB
    // -------------------------------------------------

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

      expiryNotificationsSent: [],
    });

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    res.status(201).json({
      success: true,

      message: "Document uploaded successfully",

      document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    // -------------------------------------------------
    // CLEANUP SUPABASE FILE IF MONGODB FAILED
    // -------------------------------------------------

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

// =====================================================
// GET SIGNED FILE URL
// =====================================================

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

// =====================================================
// DELETE DOCUMENT
// =====================================================

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

    // -------------------------------------------------
    // DELETE FILE FROM SUPABASE
    // -------------------------------------------------

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

    // -------------------------------------------------
    // DELETE MONGODB DOCUMENT
    // -------------------------------------------------

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

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getDocuments,
  scanDocument,
  createDocument,
  getDocument,
  getDocumentFileUrl,
  deleteDocument,
};
