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

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [expiry, setExpiry] = useState("");
  const [description, setDescription] =
    useState("");

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) return;

    // Maximum 10 MB
    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Please select a file smaller than 10 MB."
      );
      return;
    }

    setFile(selectedFile);

    // Automatically use filename
    // as document name
    if (!name) {
      const fileName =
        selectedFile.name.replace(
          /\.[^/.]+$/,
          ""
        );

      setName(fileName);
    }
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const submit = () => {

    if (!file) {
      alert(
        "Please select a document file."
      );
      return;
    }

    if (!name || !category) {
      alert(
        "Please enter document name and category."
      );
      return;
    }

    // ===================================================
    // READ FILE
    // ===================================================

    const reader = new FileReader();

    reader.onload = () => {

      const fileData =
        reader.result;

      // =================================================
      // CREATE DOCUMENT OBJECT
      // =================================================

      const newDocument = {

        // Unique ID
        id:
          Date.now().toString() +
          Math.random()
            .toString(36)
            .substring(2, 8),

        // Document information
        name: name.trim(),
        category: category,

        description:
          description.trim(),

        // Upload date
        date:
          new Date().toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          ),

        // =================================================
        // EXPIRY DATE
        // =================================================

        expiry: expiry || null,

        // These are kept for your existing UI
        icon: "identity",
        color: "blue",

        // =================================================
        // FILE INFORMATION
        // =================================================

        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: fileData,
      };

      // =================================================
      // SEND DOCUMENT TO APP.JSX
      // =================================================

      onUpload(newDocument);

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      alert(
        "Document uploaded successfully!"
      );

      // =================================================
      // GO BACK TO HOME
      // =================================================

      onNavigate("home");
    };

    reader.onerror = () => {
      alert(
        "Unable to read the selected file."
      );
    };

    reader.readAsDataURL(file);
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
                e.target.value
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
                e.target.value
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
                  e.target.value
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
                e.target.value
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
        >

          <Upload size={18} />

          Upload Document

        </button>

      </main>

    </div>
  );
}

export default UploadDocument;