const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getDocuments,
  createDocument,
  getDocument,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// =====================================================
// GET ALL DOCUMENTS FOR LOGGED-IN USER
// =====================================================

router.get("/", protect, getDocuments);

// =====================================================
// CREATE DOCUMENT
// =====================================================

router.post("/", protect, createDocument);

// =====================================================
// GET ONE DOCUMENT
// =====================================================

router.get("/:id", protect, getDocument);

// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete("/:id", protect, deleteDocument);

module.exports = router;
