import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Camera,
  RotateCcw,
  Check,
  X,
  CalendarDays,
} from "lucide-react";

function ScanDocument({
  onNavigate,
  onUpload,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState("");

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [description, setDescription] =
    useState("");


  // =====================================================
  // START CAMERA
  // =====================================================

  const startCamera = async () => {

    try {

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert(
          "Camera access is not supported by this browser."
        );

        return;
      }


      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
          },
          audio: false,
        });


      streamRef.current = stream;


      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }


      setCameraActive(true);

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

      alert(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  };


  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    setCameraActive(false);
  };


  // =====================================================
  // CAMERA CLEANUP
  // =====================================================

  useEffect(() => {

    startCamera();

    return () => {
      stopCamera();
    };

  }, []);


  // =====================================================
  // CAPTURE DOCUMENT
  // =====================================================

  const captureDocument = () => {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    if (!video || !canvas) {
      return;
    }


    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      alert(
        "Camera is not ready yet. Please try again."
      );

      return;
    }


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.92
      );


    setCapturedImage(image);

    stopCamera();
  };


  // =====================================================
  // RETAKE
  // =====================================================

  const retake = async () => {

    setCapturedImage("");

    await startCamera();
  };


  // =====================================================
  // SAVE SCANNED DOCUMENT
  // =====================================================

  const saveScan = () => {

    if (!capturedImage) {

      alert(
        "Please scan a document first."
      );

      return;
    }


    if (!name.trim()) {

      alert(
        "Please enter document name."
      );

      return;
    }


    if (!category) {

      alert(
        "Please select a category."
      );

      return;
    }


    // Convert the captured image
    // into a File object.

    const byteString =
      atob(
        capturedImage.split(",")[1]
      );

    const mimeString =
      capturedImage
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];


    const arrayBuffer =
      new ArrayBuffer(
        byteString.length
      );

    const intArray =
      new Uint8Array(
        arrayBuffer
      );


    for (
      let i = 0;
      i < byteString.length;
      i++
    ) {

      intArray[i] =
        byteString.charCodeAt(i);
    }


    const scannedFile =
      new File(
        [intArray],
        `${name.trim()}.jpg`,
        {
          type: mimeString,
        }
      );


    const newDocument = {

      id:
        Date.now().toString() +
        Math.random()
          .toString(36)
          .substring(2, 8),

      name:
        name.trim(),

      category,

      description:
        description.trim(),

      date:
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      expiry:
        expiry || null,

      icon:
        category === "Identity"
          ? "identity"
          : category === "Education"
          ? "education"
          : category === "Financial"
          ? "financial"
          : category === "Health"
          ? "health"
          : category === "Property"
          ? "property"
          : "identity",

      color:
        category === "Education" ||
        category === "Health"
          ? "red"
          : category === "Property"
          ? "orange"
          : "blue",

      fileName:
        scannedFile.name,

      fileType:
        scannedFile.type,

      fileSize:
        scannedFile.size,

      fileData:
        capturedImage,

      scanned:
        true,
    };


    onUpload(newDocument);

    alert(
      "Document scanned successfully!"
    );

    onNavigate("home");
  };


  return (
    <div className="mobile-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={() => {

            stopCamera();

            onNavigate("home");

          }}
        >
          <ChevronLeft size={23} />
        </button>

        <h1>
          Scan Document
        </h1>

        <div
          style={{
            width: 24,
          }}
        />

      </header>


      <main
        className="page-content"
        style={{
          paddingBottom: "40px",
        }}
      >


        {/* =================================================
            CAMERA / PREVIEW
        ================================================= */}

        {!capturedImage ? (

          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
              borderRadius: "18px",
              background: "#111",
              marginBottom: "20px",
            }}
          >

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                display: "block",
                minHeight: "300px",
                objectFit: "cover",
              }}
            />


            {/* DOCUMENT GUIDE */}

            <div
              style={{
                position: "absolute",
                inset: "12%",
                border:
                  "2px solid white",
                borderRadius: "10px",
                pointerEvents: "none",
              }}
            />


            <div
              style={{
                position: "absolute",
                bottom: "18px",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >

              <button
                type="button"
                onClick={
                  captureDocument
                }
                disabled={
                  !cameraActive
                }
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  border:
                    "5px solid white",
                  background:
                    "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >

                <Camera
                  size={28}
                  color="white"
                />

              </button>

            </div>

          </div>

        ) : (

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <img
              src={capturedImage}
              alt="Scanned document"
              style={{
                width: "100%",
                display: "block",
                borderRadius: "18px",
                background: "#eee",
              }}
            />


            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
              }}
            >

              <button
                type="button"
                onClick={retake}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >

                <RotateCcw size={17} />

                Retake

              </button>

            </div>

          </div>

        )}


        {/* =================================================
            DOCUMENT DETAILS
        ================================================= */}

        {capturedImage && (

          <>

            <h3 className="section-title">
              Document Details
            </h3>


            {/* NAME */}

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


            {/* EXPIRY */}

            <div className="form-group">

              <label>
                Expiry Date (Optional)
              </label>

              <div
                className="input-with-icon"
              >

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


            {/* SAVE */}

            <button
              type="button"
              onClick={saveScan}
              className="upload-submit"
            >

              <Check size={18} />

              Save Scanned Document

            </button>

          </>

        )}

      </main>


      {/* Hidden canvas */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

    </div>
  );
}

export default ScanDocument;