const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getDocuments,
  scanDocument,
  createDocument,
  getDocument,
  getDocumentFileUrl,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// =====================================================
// GET ALL DOCUMENTS
// =====================================================

router.get("/", protect, getDocuments);

// =====================================================
// OCR SCAN DOCUMENT
// =====================================================
//
// This route scans the selected JPG / PNG / WEBP / PDF
// before the document is permanently uploaded.
//
// Frontend sends:
// FormData {
//   file: selectedFile
// }
//
// Backend returns:
// - extractedText
// - documentType
// - expiryDate
// - originalFileName
// - fileType
// - fileSize
//
// IMPORTANT:
// Keep this route BEFORE /:id
// =====================================================

router.post("/scan", protect, upload.single("file"), scanDocument);

// =====================================================
// CREATE / UPLOAD DOCUMENT
// =====================================================
//
// This is the final upload.
// The file is stored in Supabase Storage and its
// metadata is stored in MongoDB.
// =====================================================

router.post("/", protect, upload.single("file"), createDocument);

// =====================================================
// GET SIGNED FILE URL
// =====================================================
//
// IMPORTANT:
// This must come BEFORE /:id
// =====================================================

router.get("/:id/file-url", protect, getDocumentFileUrl);

// =====================================================
// GET ONE DOCUMENT
// =====================================================

router.get("/:id", protect, getDocument);

// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete("/:id", protect, deleteDocument);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
