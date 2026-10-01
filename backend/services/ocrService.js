// backend/services/ocrService.js

const Tesseract = require("tesseract.js");

/**
 * Run OCR on an uploaded image.
 *
 * @param {Buffer} fileBuffer - Uploaded file buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (fileBuffer) => {
  try {
    if (!fileBuffer) {
      throw new Error("No file buffer provided for OCR.");
    }

    console.log("Starting OCR...");

    const result = await Tesseract.recognize(fileBuffer, "eng", {
      logger: (info) => {
        if (info.status === "recognizing text") {
          console.log(
            `OCR progress: ${Math.round((info.progress || 0) * 100)}%`,
          );
        }
      },
    });

    const text = result?.data?.text || "";

    console.log("OCR completed.");

    return text.trim();
  } catch (error) {
    console.error("OCR service error:", error);

    throw new Error("Failed to extract text from document.");
  }
};

module.exports = {
  extractTextFromImage,
};
