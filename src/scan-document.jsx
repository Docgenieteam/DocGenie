import { useEffect, useRef, useState } from "react";

function ScanDocument({ onNavigate, onScanComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");

  // =====================================================
  // START CAMERA
  // =====================================================

  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraReady(false);

      if (!navigator.mediaDevices) {
        setCameraError(
          "Camera is not supported by this browser."
        );
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera access is not available in this browser."
        );
        return;
      }

      // Stop previous camera if one exists
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
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
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        setCameraReady(true);
      }
    } catch (error) {
      console.error(
        "Camera access error:",
        error
      );

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser settings and try again."
        );
      } else if (
        error.name === "NotFoundError"
      ) {
        setCameraError(
          "No camera was found on this device."
        );
      } else if (
        error.name === "NotReadableError"
      ) {
        setCameraError(
          "The camera is already being used by another application."
        );
      } else if (
        error.name === "SecurityError"
      ) {
        setCameraError(
          "Camera access is blocked because this page is not using a secure connection."
        );
      } else {
        setCameraError(
          "Unable to open the camera. Please check your browser permissions and try again."
        );
      }
    }
  };

  // =====================================================
  // START CAMERA WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // CAPTURE PHOTO
  // =====================================================

  const captureDocument = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Camera is not ready.");
      return;
    }

    if (!cameraReady) {
      alert("Please wait for the camera to open.");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      alert(
        "Camera image is not available yet. Please try again."
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    setCapturedImage(image);

    // Stop camera after capture
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraReady(false);
  };

  // =====================================================
  // RETAKE
  // =====================================================

  const retakePhoto = () => {
    setCapturedImage("");
    startCamera();
  };

  // =====================================================
  // USE SCANNED DOCUMENT
  // =====================================================

  const useDocument = () => {
    if (!capturedImage) {
      alert("Please capture a document first.");
      return;
    }

    if (onScanComplete) {
      onScanComplete(capturedImage);
    } else {
      // Store temporarily if another page needs it
      sessionStorage.setItem(
        "docgenie-scanned-document",
        capturedImage
      );

      onNavigate("upload");
    }
  };

  // =====================================================
  // GALLERY
  // =====================================================

  const handleGallery = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setCapturedImage(
        reader.result
      );

      // Stop camera
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      setCameraReady(false);
    };

    reader.onerror = () => {
      alert(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="scan-page">

      {/* HEADER */}

      <div className="scan-header">
        <button
          className="scan-back-button"
          onClick={() =>
            onNavigate("home")
          }
          type="button"
        >
          ←
        </button>

        <h1>Scan Document</h1>

        <div className="scan-header-space" />
      </div>

      {/* CAMERA */}

      <div className="scan-content">

        <div className="camera-container">

          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                playsInline
                muted
              />

              {!cameraReady &&
                !cameraError && (
                  <div className="camera-message">
                    <div className="camera-icon">
                      📷
                    </div>

                    <p>
                      Opening camera...
                    </p>
                  </div>
                )}

              {cameraError && (
                <div className="camera-message error">
                  <div className="camera-icon">
                    📷
                  </div>

                  <p>
                    {cameraError}
                  </p>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="retry-camera-button"
                  >
                    Try Camera Again
                  </button>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Scanned document"
              className="captured-image"
            />
          )}

          {/* DOCUMENT FRAME */}

          {!capturedImage &&
            cameraReady && (
              <div className="document-frame">
                <div className="corner top-left" />
                <div className="corner top-right" />
                <div className="corner bottom-left" />
                <div className="corner bottom-right" />
              </div>
            )}

        </div>

        {/* HIDDEN CANVAS */}

        <canvas
          ref={canvasRef}
          style={{
            display: "none",
          }}
        />

        {/* CAMERA ERROR */}

        {cameraError && (
          <div className="camera-help">
            <p>
              <strong>
                Camera permission needed
              </strong>
            </p>

            <p>
              If you are using your phone, tap
              the camera/lock icon in the
              browser address bar and allow
              camera access.
            </p>
          </div>
        )}

        {/* CAPTURE BUTTON */}

        {!capturedImage ? (
          <>
            <button
              type="button"
              className="capture-button"
              onClick={captureDocument}
              disabled={!cameraReady}
            >
              📷
              <span>
                Capture Document
              </span>
            </button>

            {/* GALLERY */}

            <label
              className="gallery-button"
            >
              🖼️
              <span>
                Choose Image From Gallery
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleGallery
                }
                style={{
                  display: "none",
                }}
              />
            </label>

            <p className="scan-instruction">
              Place your document inside the
              camera frame and make sure the
              document is clearly visible.
            </p>
          </>
        ) : (
          <>
            {/* RETAKE */}

            <button
              type="button"
              className="retake-button"
              onClick={retakePhoto}
            >
              🔄 Retake
            </button>

            {/* USE DOCUMENT */}

            <button
              type="button"
              className="use-document-button"
              onClick={useDocument}
            >
              ✓ Use This Document
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default ScanDocument;