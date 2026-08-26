import React, { useState } from "react";

import {
  ArrowLeft,
  Share2,
  FileText,
  Search,
  Check,
  FileImage,
} from "lucide-react";


function ShareDocument({
  documents = [],
  onNavigate,
}) {

  const [search, setSearch] = useState("");

  const [selectedDocument, setSelectedDocument] =
    useState(null);


  const filteredDocuments =
    documents.filter((document) =>
      document.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );


  // ==========================================
  // SHARE ACTUAL DOCUMENT
  // ==========================================

  const handleShare = async () => {

    if (!selectedDocument) {

      alert(
        "Please select a document first."
      );

      return;
    }


    // Make sure actual file exists

    if (!selectedDocument.file) {

      alert(
        "This document does not contain an uploaded file. Please upload it again."
      );

      return;
    }


    const file =
      selectedDocument.file;


    // Check whether browser supports
    // sharing files

    if (
      !navigator.share ||
      !navigator.canShare
    ) {

      alert(
        "Your browser does not support file sharing. Please try Chrome on Android or another supported browser."
      );

      return;
    }


    // Check if this particular file
    // can be shared

    const shareable =
      navigator.canShare({
        files: [file],
      });


    if (!shareable) {

      alert(
        "This browser cannot share this file type."
      );

      return;
    }


    try {

      await navigator.share({

        title:
          `DocGenie - ${selectedDocument.name}`,

        text:
          `Sharing ${selectedDocument.name} from DocGenie.`,

        files: [file],

      });

    } catch (error) {

      // User cancelled share menu

      if (
        error.name ===
        "AbortError"
      ) {

        return;
      }


      console.error(
        "File sharing failed:",
        error
      );


      alert(
        "Unable to share the document."
      );
    }
  };


  return (

    <div className="mobile-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="top-header">

        <button
          type="button"
          className="menu-button"
          onClick={() =>
            onNavigate("home")
          }
          aria-label="Back"
        >

          <ArrowLeft size={22} />

        </button>


        <div className="home-logo">

          <Share2 size={24} />

          <span>
            Share Document
          </span>

        </div>


        <div
          style={{
            width: "40px",
          }}
        />

      </header>


      {/* =====================================
          CONTENT
      ===================================== */}

      <main className="page-content">


        {/* INTRO */}

        <div className="share-page-header">

          <div className="share-large-icon">

            <Share2 size={32} />

          </div>


          <h2>
            Share a Document
          </h2>


          <p>
            Select a document to share
            its actual file.
          </p>

        </div>


        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* DOCUMENT LIST */}

        <div className="share-document-list">

          {filteredDocuments.length === 0 ? (

            <div className="empty-share">

              <FileText
                size={40}
              />

              <p>
                No documents found
              </p>

            </div>

          ) : (

            filteredDocuments.map(
              (document) => {

                const selected =
                  selectedDocument?.id ===
                  document.id;


                return (

                  <button
                    type="button"
                    key={document.id}
                    className={
                      `share-document-card ${
                        selected
                          ? "selected"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setSelectedDocument(
                        document
                      )
                    }
                  >


                    {/* ICON */}

                    <div className="share-document-icon">

                      {document.fileType?.startsWith(
                        "image/"
                      ) ? (

                        <FileImage
                          size={23}
                        />

                      ) : (

                        <FileText
                          size={23}
                        />

                      )}

                    </div>


                    {/* INFO */}

                    <div className="share-document-info">

                      <strong>
                        {document.name}
                      </strong>


                      <span>
                        {document.category}
                      </span>


                      <small>

                        {document.fileName ||
                          "Uploaded document"}

                      </small>

                    </div>


                    {/* SELECTED */}

                    {selected && (

                      <div className="share-selected">

                        <Check
                          size={18}
                        />

                      </div>

                    )}

                  </button>

                );

              }
            )

          )}

        </div>


        {/* SHARE BUTTON */}

        <button
          type="button"
          className="share-main-button"
          onClick={handleShare}
          disabled={!selectedDocument}
        >

          <Share2 size={20} />

          <span>
            Share Document
          </span>

        </button>


      </main>

    </div>

  );

}


export default ShareDocument;