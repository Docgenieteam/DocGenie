import React, { useState } from "react";

import {
  ChevronLeft,
  CloudUpload,
  Upload,
  CalendarDays,
} from "lucide-react";

function UploadDocument({
  onNavigate,
  onUpload,
}) {
  const [file, setFile] = useState(null);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [uploading, setUploading] =
    useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // Maximum 10 MB
    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Please select a file smaller than 10 MB.",
      );

      e.target.value = "";
      return;
    }

    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type,
      )
    ) {
      alert(
        "Only JPG, PNG, WEBP and PDF files are allowed.",
      );

      e.target.value = "";
      return;
    }

    setFile(selectedFile);

    // Automatically use filename
    // as document name
    if (!name) {
      const fileName =
        selectedFile.name.replace(
          /\.[^/.]+$/,
          "",
        );

      setName(fileName);
    }
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const submit = async () => {
    if (!file) {
      alert(
        "Please select a document file.",
      );
      return;
    }

    if (!name.trim() || !category) {
      alert(
        "Please enter document name and category.",
      );
      return;
    }

    if (uploading) {
      return;
    }

    setUploading(true);

    try {
      // =================================================
      // GET LOGIN TOKEN
      // =================================================

      const token =
        localStorage.getItem(
          "token",
        ) ||
        localStorage.getItem(
          "docgenie-token",
        );

      if (!token) {
        alert(
          "Your session has expired. Please login again.",
        );

        setUploading(false);
        return;
      }

      // =================================================
      // CREATE FORMDATA
      // =================================================

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "name",
        name.trim(),
      );

      formData.append(
        "category",
        category,
      );

      formData.append(
        "expiry",
        expiry || "",
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "date",
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        ),
      );

      formData.append(
        "icon",
        "identity",
      );

      formData.append(
        "color",
        "blue",
      );

      // =================================================
      // SEND TO BACKEND
      // =================================================

      const response =
        await fetch(
          `${API_URL}/api/documents`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          },
        );

      // =================================================
      // READ RESPONSE
      // =================================================

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload document.",
        );
      }

      // =================================================
      // SEND SAVED DOCUMENT TO APP
      // =================================================

      if (onUpload) {
        onUpload(
          data.document,
        );
      }

      alert(
        "Document uploaded successfully!",
      );

      // =================================================
      // GO HOME
      // =================================================

      onNavigate("home");
    } catch (error) {
      console.error(
        "Upload error:",
        error,
      );

      alert(
        error.message ||
          "Unable to connect to the server. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mobile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={() =>
            onNavigate("home")
          }
        >
          <ChevronLeft size={23} />
        </button>

        <h1>
          Upload Document
        </h1>

        <div
          style={{
            width: 24,
          }}
        />

      </header>

      <main className="page-content upload-content">

        {/* =================================================
            FILE UPLOAD BOX
        ================================================= */}

        <label
          className="upload-box"
          htmlFor="document-file"
        >

          <CloudUpload size={42} />

          <strong>
            {file
              ? file.name
              : "Drag & Drop Files Here"}
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
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={
            handleFileChange
          }
        />

        {/* =================================================
            DOCUMENT DETAILS
        ================================================= */}

        <h3 className="section-title">
          Document Details
        </h3>

        {/* DOCUMENT NAME */}

        <div className="form-group">

          <label>
            Document Name
          </label>

          <input
            placeholder="Enter document name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value,
              )
            }
          />

        </div>

        {/* CATEGORY */}

        <div className="form-group">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value,
              )
            }
          >

            <option value="">
              Select Category
            </option>

            <option value="Identity">
              Identity
            </option>

            <option value="Education">
              Education
            </option>

            <option value="Financial">
              Financial
            </option>

            <option value="Health">
              Health
            </option>

            <option value="Property">
              Property
            </option>

            <option value="Others">
              Others
            </option>

          </select>

        </div>

        {/* EXPIRY DATE */}

        <div className="form-group">

          <label>
            Expiry Date (Optional)
          </label>

          <div className="input-with-icon">

            <input
              type="date"
              value={expiry}
              onChange={(e) =>
                setExpiry(
                  e.target.value,
                )
              }
            />

            <CalendarDays
              size={18}
            />

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="form-group">

          <label>
            Description (Optional)
          </label>

          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
          />

        </div>

        {/* =================================================
            SUBMIT
        ================================================= */}

        <button
          className="upload-submit"
          onClick={submit}
          disabled={uploading}
        >

          <Upload size={18} />

          {uploading
            ? "Uploading..."
            : "Upload Document"}

        </button>

      </main>

    </div>
  );
}

export default UploadDocument;