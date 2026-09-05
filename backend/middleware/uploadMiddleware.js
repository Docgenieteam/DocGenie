const multer = require("multer");

// Store uploaded files temporarily in memory.
// The file buffer is then uploaded directly to Supabase Storage.
const storage = multer.memoryStorage();

// Allowed file types
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and PDF files are allowed."));
    }

    cb(null, true);
  },
});

// Export the Multer instance
module.exports = upload;
