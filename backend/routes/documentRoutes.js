const express = require("express");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  getDocuments,
  createDocument,
  getDocument,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// =====================================================
// GET ALL DOCUMENTS
// =====================================================

router.get("/", protect, getDocuments);

// =====================================================
// UPLOAD DOCUMENT
// =====================================================
//
// "file" MUST match the FormData field name
// used by UploadDocument.jsx
//
// =====================================================

router.post("/", protect, upload.single("file"), createDocument);

// =====================================================
// GET ONE DOCUMENT
// =====================================================

router.get("/:id", protect, getDocument);

// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete("/:id", protect, deleteDocument);

module.exports = router;
