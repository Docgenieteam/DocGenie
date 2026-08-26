import React from "react";

import {
  ChevronLeft,
  Eye,
  Download,
  Share2,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";

import { DocumentIcon } from "./documents";

function DocumentDetails({
  document,
  onNavigate,
  onDelete,
}) {

  // =========================================
  // DOCUMENT NOT FOUND
  // =========================================

  if (!document) {
    return (
      <div className="mobile-page">
        <div className="empty-page">
          Document not found.
        </div>
      </div>
    );
  }


  // =========================================
  // VIEW DOCUMENT
  // =========================================

  const handleView = () => {

    if (!document.fileData) {
      alert(
        "This document does not have a stored file. Please upload it again."
      );

      return;
    }

    // Open document in a new browser tab
    const newWindow = window.open();

    if (!newWindow) {
      alert(
        "Please allow pop-ups to view the document."
      );

      return;
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>${document.name}</title>

          <style>
            body {
              margin: 0;
              background: #111;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }

            img,
            iframe {
              width: 100%;
              height: 100vh;
              object-fit: contain;
              border: none;
            }
          </style>
        </head>

        <body>
          ${
            document.fileType?.startsWith("image/")
              ? `<img src="${document.fileData}" alt="${document.name}" />`
              : `<iframe src="${document.fileData}"></iframe>`
          }
        </body>
      </html>
    `);

    newWindow.document.close();
  };


  // =========================================
  // DOWNLOAD DOCUMENT
  // =========================================

  const handleDownload = () => {

    if (!document.fileData) {
      alert(
        "This document does not have a stored file. Please upload it again."
      );

      return;
    }

    try {

      const link =
        window.document.createElement("a");

      link.href = document.fileData;

      link.download =
        document.fileName ||
        document.name ||
        "document";

      window.document.body.appendChild(link);

      link.click();

      window.document.body.removeChild(link);

    } catch (error) {

      console.error(
        "Download failed:",
        error
      );

      alert(
        "Unable to download this document."
      );
    }
  };


  // =========================================
  // SHARE DOCUMENT
  // =========================================

  const handleShare = async () => {

    // Check whether actual file exists
    if (!document.fileData) {

      alert(
        "This document does not have a stored file. Please upload it again."
      );

      return;
    }

    try {

      // Convert Data URL into Blob
      const response =
        await fetch(document.fileData);

      const blob =
        await response.blob();


      // Create actual File object
      const file = new File(
        [blob],
        document.fileName ||
          `${document.name || "document"}`,
        {
          type:
            document.fileType ||
            blob.type ||
            "application/octet-stream",
        }
      );


      // =====================================
      // MOBILE / BROWSER NATIVE SHARE
      // =====================================

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {

        await navigator.share({

          title:
            document.name ||
            "DocGenie Document",

          text:
            `Sharing ${document.name || "document"} from DocGenie.`,

          files: [file],

        });

        return;
      }


      // =====================================
      // FALLBACK
      // =====================================

      // If browser doesn't support
      // file sharing, download the file.

      const downloadUrl =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = downloadUrl;

      link.download =
        document.fileName ||
        document.name ||
        "document";

      window.document.body.appendChild(link);

      link.click();

      window.document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);


      alert(
        "Your browser does not support direct file sharing. The document has been downloaded. You can now share it using WhatsApp, Gmail, etc."
      );

    } catch (error) {

      console.error(
        "Share failed:",
        error
      );

      // User cancelled share
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      alert(
        "Unable to share this document. Please try again."
      );
    }
  };


  // =========================================
  // RENAME
  // =========================================

  const handleRename = () => {

    const newName =
      window.prompt(
        "Enter new document name:",
        document.name
      );

    if (!newName) return;

    alert(
      "Rename feature will be connected to document storage next."
    );
  };


  return (
    <div className="mobile-page">


      {/* =========================================
          HEADER
      ========================================= */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={() =>
            onNavigate("documents")
          }
        >
          <ChevronLeft size={23} />
        </button>

        <h1>
          Document Details
        </h1>

        <div
          style={{
            width: 24,
          }}
        />

      </header>


      {/* =========================================
          CONTENT
      ========================================= */}

      <main className="page-content details-content">


        {/* =========================================
            DOCUMENT INFORMATION
        ========================================= */}

        <section className="document-detail-card">

          <div className="detail-title-row">

            <DocumentIcon
              type={document.icon}
              color={
                document.color ||
                "blue"
              }
            />

            <div>

              <strong>
                {document.name}
              </strong>

              <span>
                Government Issued
              </span>

            </div>

            <span className="verified-badge">
              Verified
            </span>

          </div>


          <Detail
            label="Category"
            value={
              document.category ||
              "Not specified"
            }
          />


          <Detail
            label="Added On"
            value={
              document.date ||
              "Not available"
            }
          />


          <Detail
            label="Expiry Date"
            value={
              document.expiry ||
              "No expiry date"
            }
            danger={
              Boolean(document.expiry)
            }
          />


          <Detail
            label="File Size"
            value={
              document.fileSize
                ? formatFileSize(
                    document.fileSize
                  )
                : "Not available"
            }
          />


          <Detail
            label="Description"
            value={
              document.description ||
              "Securely stored document"
            }
          />

        </section>


        {/* =========================================
            ACTIONS
        ========================================= */}

        <h3 className="section-title">
          Actions
        </h3>


        <div className="detail-actions">


          {/* VIEW */}

          <Action
            icon={<Eye />}
            text="View"
            onClick={handleView}
          />


          {/* DOWNLOAD */}

          <Action
            icon={<Download />}
            text="Download"
            onClick={handleDownload}
          />


          {/* SHARE */}

          <Action
            icon={<Share2 />}
            text="Share"
            onClick={handleShare}
          />


          {/* RENAME */}

          <Action
            icon={<Pencil />}
            text="Rename"
            onClick={handleRename}
          />


          {/* DELETE */}

          <Action
            danger
            icon={<Trash2 />}
            text="Delete"
            onClick={() =>
              onDelete(document.id)
            }
          />

        </div>


        {/* =========================================
            SECURITY MESSAGE
        ========================================= */}

        <div className="secure-message">

          <ShieldCheck size={23} />

          <div>

            <strong>
              This document is securely stored
            </strong>

            <span>
              Your document is protected and encrypted.
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =============================================
   DETAIL COMPONENT
============================================= */

function Detail({
  label,
  value,
  danger,
}) {

  return (
    <div className="detail-line">

      <span>
        {label}
      </span>

      <strong
        className={
          danger
            ? "danger-text"
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}


/* =============================================
   ACTION BUTTON
============================================= */

function Action({
  icon,
  text,
  danger,
  onClick,
}) {

  return (
    <button
      type="button"
      className={
        danger
          ? "detail-action danger"
          : "detail-action"
      }
      onClick={onClick}
    >

      {icon}

      <span>
        {text}
      </span>

    </button>
  );
}


/* =============================================
   FILE SIZE
============================================= */

function formatFileSize(bytes) {

  if (!bytes) {
    return "0 KB";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return (
    parseFloat(
      (
        bytes /
        Math.pow(
          1024,
          index
        )
      ).toFixed(2)
    ) +
    " " +
    units[index]
  );
}


export default DocumentDetails;