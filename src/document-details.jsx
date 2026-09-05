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

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://docgenie-xle5.onrender.com"
    : "http://localhost:5000");

function DocumentDetails({
  document,
  onNavigate,
  onDelete,
}) {
  if (!document) {
    return (
      <div className="mobile-page">
        <div className="empty-page">
          Document not found.
        </div>
      </div>
    );
  }

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("docgenie-token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("docgenie-token") ||
      sessionStorage.getItem("token")
    );
  };

  // =====================================================
  // GET SIGNED FILE URL
  // =====================================================

  const getFileUrl = async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    if (!document._id) {
      throw new Error(
        "Document ID not found."
      );
    }

    const response = await fetch(
      `${API_URL}/api/documents/${document._id}/file-url`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok || !data.success) {
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      throw new Error(
        data.message ||
          "Failed to access document."
      );
    }

    return data;
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = async () => {
    let newWindow = null;

    try {
      newWindow = window.open(
        "",
        "_blank"
      );

      if (!newWindow) {
        alert(
          "Please allow pop-ups to view the document."
        );
        return;
      }

      newWindow.document.write(`
        <html>
          <head>
            <title>Loading document...</title>
            <style>
              body {
                margin: 0;
                background: #111;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>
            Loading document...
          </body>
        </html>
      `);

      const data =
        await getFileUrl();

      const title =
        data.fileName ||
        document.name ||
        "DocGenie Document";

      const isImage =
        data.fileType &&
        data.fileType.startsWith(
          "image/"
        );

      newWindow.document.open();

      if (isImage) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  margin: 0;
                  background: #111;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                }

                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                }
              </style>
            </head>

            <body>
              <img
                src="${data.url}"
                alt="${title}"
              />
            </body>
          </html>
        `);
      } else {
        newWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  margin: 0;
                  background: #111;
                }

                iframe {
                  width: 100%;
                  height: 100vh;
                  border: none;
                }
              </style>
            </head>

            <body>
              <iframe
                src="${data.url}"
                title="${title}"
              ></iframe>
            </body>
          </html>
        `);
      }

      newWindow.document.close();
    } catch (error) {
      console.error(
        "View failed:",
        error
      );

      if (
        newWindow &&
        !newWindow.closed
      ) {
        newWindow.close();
      }

      alert(
        error.message ||
          "Unable to view this document."
      );
    }
  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const handleDownload = async () => {
    try {
      const data =
        await getFileUrl();

      const response =
        await fetch(data.url);

      if (!response.ok) {
        throw new Error(
          "Failed to download document."
        );
      }

      const blob =
        await response.blob();

      const downloadUrl =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a"
        );

      link.href =
        downloadUrl;

      link.download =
        data.fileName ||
        document.originalFileName ||
        document.name ||
        "document";

      window.document.body.appendChild(
        link
      );

      link.click();

      window.document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        downloadUrl
      );
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );

      alert(
        error.message ||
          "Unable to download this document."
      );
    }
  };

  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {
    try {
      const data =
        await getFileUrl();

      // -------------------------------------------------
      // NATIVE FILE SHARE
      // -------------------------------------------------

      if (
        navigator.share &&
        navigator.canShare
      ) {
        const response =
          await fetch(data.url);

        if (!response.ok) {
          throw new Error(
            "Unable to access document file."
          );
        }

        const blob =
          await response.blob();

        const fileName =
          data.fileName ||
          document.originalFileName ||
          document.name ||
          "document";

        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                data.fileType ||
                blob.type ||
                "application/octet-stream",
            }
          );

        if (
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share({
            title:
              document.name ||
              "DocGenie Document",

            text:
              `Sharing ${
                document.name ||
                "document"
              } from DocGenie.`,

            files: [file],
          });

          return;
        }
      }

      // -------------------------------------------------
      // URL SHARE
      // -------------------------------------------------

      if (navigator.share) {
        await navigator.share({
          title:
            document.name ||
            "DocGenie Document",

          text:
            `Sharing ${
              document.name ||
              "document"
            } from DocGenie.`,

          url: data.url,
        });

        return;
      }

      // -------------------------------------------------
      // CLIPBOARD FALLBACK
      // -------------------------------------------------

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          data.url
        );

        alert(
          "Document link copied to clipboard. You can now share it."
        );

        return;
      }

      alert(
        "Your browser does not support document sharing."
      );
    } catch (error) {
      console.error(
        "Share failed:",
        error
      );

      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      alert(
        error.message ||
          "Unable to share this document."
      );
    }
  };

  // =====================================================
  // RENAME
  // =====================================================

  const handleRename = () => {
    const newName =
      window.prompt(
        "Enter new document name:",
        document.name
      );

    if (!newName) {
      return;
    }

    alert(
      "Rename feature will be connected next."
    );
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = () => {
    if (!document._id) {
      alert(
        "Unable to delete this document."
      );

      return;
    }

    onDelete(document._id);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mobile-page">

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

      <main className="page-content details-content">

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

        <h3 className="section-title">
          Actions
        </h3>

        <div className="detail-actions">

          <Action
            icon={<Eye />}
            text="View"
            onClick={handleView}
          />

          <Action
            icon={<Download />}
            text="Download"
            onClick={handleDownload}
          />

          <Action
            icon={<Share2 />}
            text="Share"
            onClick={handleShare}
          />

          <Action
            icon={<Pencil />}
            text="Rename"
            onClick={handleRename}
          />

          <Action
            danger
            icon={<Trash2 />}
            text="Delete"
            onClick={handleDelete}
          />

        </div>

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

// =====================================================
// DETAIL COMPONENT
// =====================================================

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

// =====================================================
// ACTION COMPONENT
// =====================================================

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

// =====================================================
// FILE SIZE
// =====================================================

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