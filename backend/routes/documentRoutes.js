const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getDocuments,
  createDocument,
  getDocument,
  getDocumentFileUrl,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// Get all documents for logged-in user
router.get("/", protect, getDocuments);

// Upload a new document
router.post("/", protect, upload.single("file"), createDocument);

// Get temporary signed URL for View / Download / Share
// IMPORTANT: This must come BEFORE /:id
router.get("/:id/file-url", protect, getDocumentFileUrl);

// Get one document's metadata
router.get("/:id", protect, getDocument);

// Delete document + actual Supabase file
router.delete("/:id", protect, deleteDocument);

module.exports = router;
