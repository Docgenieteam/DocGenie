// backend/services/documentDetectionService.js

/**
 * Detect the type of document from OCR text.
 */
const detectDocumentType = (text) => {
  if (!text) {
    return "Other";
  }

  const normalizedText = text.toLowerCase().replace(/\s+/g, " ").trim();

  // =====================================================
  // IDENTITY DOCUMENTS
  // =====================================================

  if (
    normalizedText.includes("passport") ||
    normalizedText.includes("passport no") ||
    normalizedText.includes("passport number")
  ) {
    return "Passport";
  }

  if (
    normalizedText.includes("driving licence") ||
    normalizedText.includes("driving license") ||
    normalizedText.includes("driver's license") ||
    normalizedText.includes("driving lic")
  ) {
    return "Driving License";
  }

  if (
    normalizedText.includes("aadhaar") ||
    normalizedText.includes("aadhar") ||
    normalizedText.includes("unique identification")
  ) {
    return "Aadhaar";
  }

  if (
    normalizedText.includes("pan card") ||
    normalizedText.includes("income tax department") ||
    normalizedText.includes("permanent account number")
  ) {
    return "PAN Card";
  }

  // =====================================================
  // EDUCATION DOCUMENTS
  // =====================================================

  if (
    normalizedText.includes("leaving certificate") ||
    normalizedText.includes("school leaving certificate") ||
    normalizedText.includes("transfer certificate") ||
    normalizedText.includes("college leaving certificate") ||
    normalizedText.includes("bonafide certificate") ||
    normalizedText.includes("marksheet") ||
    normalizedText.includes("mark sheet") ||
    normalizedText.includes("marks statement") ||
    normalizedText.includes("university") ||
    normalizedText.includes("college") ||
    normalizedText.includes("school")
  ) {
    return "Education";
  }

  // =====================================================
  // FINANCIAL DOCUMENTS
  // =====================================================

  if (
    normalizedText.includes("insurance") ||
    normalizedText.includes("policy number") ||
    normalizedText.includes("policy no") ||
    normalizedText.includes("premium")
  ) {
    return "Insurance";
  }

  // =====================================================
  // CERTIFICATES
  // =====================================================

  if (
    normalizedText.includes("certificate") ||
    normalizedText.includes("certification")
  ) {
    return "Certificate";
  }

  return "Other";
};

/**
 * Detect expiry date from OCR text.
 */
const detectExpiryDate = (text) => {
  if (!text) {
    return "";
  }

  const patterns = [
    /expiry\s*date\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,

    /expiry\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,

    /date\s*of\s*expiry\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,

    /valid\s*(?:until|till|through)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,

    /validity\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match && match[1]) {
      return normalizeDate(match[1]);
    }
  }

  return "";
};

/**
 * Convert DD/MM/YYYY or DD-MM-YYYY
 * into YYYY-MM-DD.
 */
const normalizeDate = (dateString) => {
  const parts = dateString.split(/[\/\-]/);

  if (parts.length !== 3) {
    return "";
  }

  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  const year = parts[2];

  return `${year}-${month}-${day}`;
};

module.exports = {
  detectDocumentType,
  detectExpiryDate,
};
