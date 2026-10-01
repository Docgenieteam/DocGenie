import React, { useState } from "react";

import {
  ChevronLeft,
  CloudUpload,
  Upload,
  CalendarDays,
  Sparkles,
  FileText,
  Bell,
  CheckCircle,
  ScanLine,
} from "lucide-react";

function UploadDocument({ onNavigate, onUpload }) {
  // =========================================================
  // STATE
  // =========================================================

  const [file, setFile] = useState(null);

  const [name, setName] = useState("");

  const [category, setCategory] = useState("");

  const [expiry, setExpiry] = useState("");

  const [description, setDescription] = useState("");

  const [uploading, setUploading] = useState(false);

  // OCR / AI result
  const [ocrResult, setOcrResult] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =========================================================
  // RESET DOCUMENT DATA
  // =========================================================

  const resetDocumentData = () => {
    setOcrResult(null);
    setName("");
    setCategory("");
    setExpiry("");
    setDescription("");
  };

  // =========================================================
  // MAP DETECTED DOCUMENT TYPE TO APP CATEGORY
  // =========================================================

  const mapDocumentTypeToCategory = (documentType, fileName = "") => {
    const type = String(documentType || "")
      .trim()
      .toLowerCase();

    const fileNameLower = String(fileName || "")
      .trim()
      .toLowerCase();

    // -------------------------------------------------------
    // IDENTITY DOCUMENTS
    // -------------------------------------------------------

    if (
      type.includes("passport") ||
      type.includes("driving") ||
      type.includes("license") ||
      type.includes("licence") ||
      type.includes("aadhaar") ||
      type.includes("aadhar") ||
      type.includes("pan")
    ) {
      return "Identity";
    }

    // -------------------------------------------------------
    // EDUCATION DOCUMENTS
    // -------------------------------------------------------

    if (
      type.includes("certificate") ||
      type.includes("marksheet") ||
      type.includes("mark sheet") ||
      type.includes("degree") ||
      type.includes("diploma") ||
      type.includes("leaving certificate") ||
      type === "lc" ||
      type.includes("education")
    ) {
      return "Education";
    }

    // -------------------------------------------------------
    // FINANCIAL DOCUMENTS
    // -------------------------------------------------------

    if (
      type.includes("insurance") ||
      type.includes("policy") ||
      type.includes("bank") ||
      type.includes("financial") ||
      type.includes("loan") ||
      type.includes("credit")
    ) {
      return "Financial";
    }

    // -------------------------------------------------------
    // HEALTH DOCUMENTS
    // -------------------------------------------------------

    if (
      type.includes("medical") ||
      type.includes("health") ||
      type.includes("hospital") ||
      type.includes("prescription")
    ) {
      return "Health";
    }

    // -------------------------------------------------------
    // PROPERTY DOCUMENTS
    // -------------------------------------------------------

    if (
      type.includes("property") ||
      type.includes("rent") ||
      type.includes("lease") ||
      type.includes("agreement")
    ) {
      return "Property";
    }

    // -------------------------------------------------------
    // FALLBACK: CHECK FILE NAME
    // -------------------------------------------------------

    if (
      fileNameLower.includes("lc") ||
      fileNameLower.includes("leaving") ||
      fileNameLower.includes("certificate") ||
      fileNameLower.includes("marksheet") ||
      fileNameLower.includes("mark_sheet") ||
      fileNameLower.includes("degree") ||
      fileNameLower.includes("diploma")
    ) {
      return "Education";
    }

    return "Others";
  };

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // -------------------------------------------------------
    // FILE SIZE LIMIT
    // -------------------------------------------------------

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("Please select a file smaller than 10 MB.");

      e.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // ALLOWED FILE TYPES
    // -------------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only JPG, PNG, WEBP and PDF files are allowed.");

      e.target.value = "";

      return;
    }

    // -------------------------------------------------------
    // IMPORTANT:
    // RESET PREVIOUS DOCUMENT DATA
    // -------------------------------------------------------

    resetDocumentData();

    // -------------------------------------------------------
    // SAVE NEW FILE
    // -------------------------------------------------------

    setFile(selectedFile);

    // -------------------------------------------------------
    // USE FILE NAME AS TEMPORARY DOCUMENT NAME
    // -------------------------------------------------------

    const fileNameWithoutExtension =
      selectedFile.name.replace(/\.[^/.]+$/, "");

    setName(fileNameWithoutExtension);
  };

  // =========================================================
  // UPLOAD + OCR + DOCUMENT DETECTION
  // =========================================================

  const submit = async () => {
    if (!file) {
      alert("Please select a document file.");
      return;
    }

    if (uploading) {
      return;
    }

    setUploading(true);

    try {
      // -----------------------------------------------------
      // GET LOGIN TOKEN
      // -----------------------------------------------------

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("docgenie-token");

      if (!token) {
        alert("Your session has expired. Please login again.");

        setUploading(false);

        return;
      }

      // -----------------------------------------------------
      // CREATE FORMDATA
      // -----------------------------------------------------

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "name",
        name.trim() ||
          file.name.replace(/\.[^/.]+$/, "")
      );

      /*
       * We initially send "Other".
       *
       * The backend OCR/detection service should detect
       * the actual document type.
       */
      formData.append("category", "Other");

      /*
       * Do not manually provide expiry here.
       *
       * The backend OCR service should detect it.
       */
      formData.append("expiry", "");

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "date",
        new Date().toISOString()
      );

      formData.append("icon", "document");

      formData.append("color", "blue");

      // -----------------------------------------------------
      // SEND TO BACKEND
      // -----------------------------------------------------

      console.log("Uploading document for OCR...");

      const response = await fetch(
        `${API_URL}/api/documents`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      // -----------------------------------------------------
      // READ RESPONSE
      // -----------------------------------------------------

      const data = await response.json();

      console.log("Backend upload response:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload document."
        );
      }

      // -----------------------------------------------------
      // SAVED DOCUMENT
      // -----------------------------------------------------

      const savedDocument = data.document;

      if (!savedDocument) {
        throw new Error(
          "Document was uploaded but no document data was returned."
        );
      }

      console.log(
        "OCR document result:",
        savedDocument
      );

      // -----------------------------------------------------
      // GET DETECTED DOCUMENT TYPE
      // -----------------------------------------------------

      const detectedDocumentType =
        savedDocument.detectedDocumentType ||
        savedDocument.documentType ||
        savedDocument.detectedType ||
        savedDocument.category ||
        "Other";

      // -----------------------------------------------------
      // GET AUTOMATIC CATEGORY
      // -----------------------------------------------------

      const detectedCategory =
        mapDocumentTypeToCategory(
          detectedDocumentType,
          savedDocument.name || file.name
        );

      // -----------------------------------------------------
      // GET AUTOMATIC EXPIRY
      // -----------------------------------------------------

      const detectedExpiry =
        savedDocument.detectedExpiry ||
        savedDocument.expiry ||
        "";

      // -----------------------------------------------------
      // CREATE FRONTEND OCR RESULT
      // -----------------------------------------------------

      const result = {
        ...savedDocument,

        name:
          savedDocument.name ||
          file.name.replace(/\.[^/.]+$/, ""),

        detectedDocumentType,

        category: detectedCategory,

        detectedExpiry,

        expiry:
          detectedExpiry ||
          savedDocument.expiry ||
          "",

        expiryDetectedAutomatically:
          Boolean(
            savedDocument.expiryDetectedAutomatically ||
              savedDocument.detectedExpiry
          ),

        fileType:
          savedDocument.fileType ||
          file.type,

        fileSize:
          savedDocument.fileSize ||
          file.size,
      };

      // -----------------------------------------------------
      // SAVE RESULT FOR UI
      // -----------------------------------------------------

      setOcrResult(result);

      // -----------------------------------------------------
      // AUTO FILL NAME
      // -----------------------------------------------------

      setName(result.name || "");

      // -----------------------------------------------------
      // AUTO FILL CATEGORY
      // -----------------------------------------------------

      setCategory(result.category || "Others");

      // -----------------------------------------------------
      // AUTO FILL EXPIRY
      // -----------------------------------------------------

      setExpiry(result.expiry || "");

      // -----------------------------------------------------
      // SEND DOCUMENT TO PARENT
      // -----------------------------------------------------

      if (onUpload) {
        onUpload(result);
      }

      console.log(
        "Document analysis completed successfully."
      );

      alert(
        "Document uploaded and analyzed successfully!"
      );
    } catch (error) {
      console.error(
        "Upload/OCR error:",
        error
      );

      alert(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // FORMAT FILE SIZE
  // =========================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not detected";
    }

    // YYYY-MM-DD
    const parts = String(date).split("-");

    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return date;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mobile-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={() => onNavigate("home")}
        >
          <ChevronLeft size={23} />
        </button>

        <h1>
          Upload Document
        </h1>

        <div style={{ width: 24 }} />

      </header>


      <main className="page-content upload-content">

        {/* =================================================
            FILE UPLOAD BOX
        ================================================= */}

        <label
          className="upload-box"
          htmlFor="document-file"
          style={{
            cursor: "pointer",
          }}
        >

          <CloudUpload
            size={48}
            strokeWidth={1.7}
          />

          <strong>
            {file
              ? file.name
              : "Drag & Drop File Here"}
          </strong>

          {!file && (
            <>
              <span>
                or
              </span>

              <div className="choose-file-button">

                <Upload size={16} />

                Choose File

              </div>
            </>
          )}

          {file && (
            <span>
              Click to change file
            </span>
          )}

        </label>


        <input
          id="document-file"
          type="file"
          hidden
          accept="
            .jpg,
            .jpeg,
            .png,
            .webp,
            .pdf,
            application/pdf,
            image/jpeg,
            image/png,
            image/webp
          "
          onChange={handleFileChange}
        />


        {/* =================================================
            AI OCR INFORMATION
        ================================================= */}

        <div
          style={{
            marginTop: "18px",
            padding: "18px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, #f5f0ff, #f7f9ff)",
            border: "1px solid #e2dcff",
          }}
        >

          {/* AI HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >

            <Sparkles
              size={20}
              color="#6c4ce8"
            />

            <span
              style={{
                background: "#e7ddff",
                color: "#6845d8",
                padding: "4px 9px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              AI Powered
            </span>

          </div>


          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "15px",
            }}
          >
            We'll automatically extract information
            from your document
          </div>


          {/* OCR PROCESS */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >

            <div
              style={{
                textAlign: "center",
                flex: 1,
              }}
            >

              <ScanLine
                size={22}
                color="#654de6"
              />

              <div
                style={{
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                1. OCR Scan
              </div>

            </div>


            <div>
              →
            </div>


            <div
              style={{
                textAlign: "center",
                flex: 1,
              }}
            >

              <FileText
                size={22}
                color="#654de6"
              />

              <div
                style={{
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                2. Identify Type
              </div>

            </div>


            <div>
              →
            </div>


            <div
              style={{
                textAlign: "center",
                flex: 1,
              }}
            >

              <CalendarDays
                size={22}
                color="#654de6"
              />

              <div
                style={{
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                3. Detect Expiry
              </div>

            </div>


            <div>
              →
            </div>


            <div
              style={{
                textAlign: "center",
                flex: 1,
              }}
            >

              <Bell
                size={22}
                color="#654de6"
              />

              <div
                style={{
                  fontSize: "11px",
                  marginTop: "6px",
                }}
              >
                4. Save & Remind
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            EXTRACTED INFORMATION
        ================================================= */}

        {ocrResult && (

          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #dce3ea",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >

            <h3
              style={{
                margin: "0 0 20px",
                fontSize: "17px",
              }}
            >
              Extracted Information (Auto-filled)
            </h3>


            {/* DOCUMENT TYPE */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >

              <span>
                Document Type
              </span>

              <strong>
                {ocrResult.detectedDocumentType ||
                  ocrResult.documentType ||
                  "Other"}
              </strong>

            </div>


            {/* DOCUMENT NAME */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >

              <span>
                Name
              </span>

              <strong>
                {ocrResult.name ||
                  "Not detected"}
              </strong>

            </div>


            {/* CATEGORY */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >

              <span>
                Category
              </span>

              <strong>
                {ocrResult.category ||
                  "Others"}
              </strong>

            </div>


            {/* EXPIRY DATE */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >

              <span>
                Expiry Date
              </span>

              <strong>

                {formatDate(
                  ocrResult.detectedExpiry ||
                    ocrResult.expiry
                )}

                {ocrResult.expiryDetectedAutomatically && (

                  <span
                    style={{
                      marginLeft: "8px",
                      background: "#dff8e8",
                      color: "#159447",
                      padding: "4px 7px",
                      borderRadius: "10px",
                      fontSize: "10px",
                    }}
                  >
                    Detected
                  </span>

                )}

              </strong>

            </div>


            {/* FILE TYPE */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                gap: "15px",
              }}
            >

              <span>
                File Type
              </span>

              <strong>
                {ocrResult.fileType ||
                  file?.type ||
                  "Unknown"}
              </strong>

            </div>


            {/* FILE SIZE */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
                gap: "15px",
              }}
            >

              <span>
                File Size
              </span>

              <strong>
                {formatFileSize(
                  ocrResult.fileSize ||
                    file?.size
                )}
              </strong>

            </div>


            {/* SUCCESS MESSAGE */}

            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                borderRadius: "9px",
                background: "#e8fff0",
                color: "#168847",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >

              <CheckCircle size={16} />

              Document information extracted successfully!

            </div>

          </div>

        )}


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div
          className="form-group"
          style={{
            marginTop: "18px",
          }}
        >

          <label>
            Description (Optional)
          </label>

          <textarea
            placeholder="Add a note (optional)..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

        </div>


        {/* =================================================
            UPLOAD BUTTON
        ================================================= */}

        <button
          className="upload-submit"
          onClick={submit}
          disabled={uploading}
        >

          {uploading ? (

            <>
              <ScanLine size={18} />

              Scanning document...
            </>

          ) : (

            <>
              <Upload size={18} />

              Upload Document
            </>

          )}

        </button>


        {/* =================================================
            AFTER SUCCESS
        ================================================= */}

        {ocrResult && (

          <button
            onClick={() => onNavigate("home")}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #d5d9e2",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Continue to Home
          </button>

        )}

      </main>

    </div>
  );
}

export default UploadDocument;