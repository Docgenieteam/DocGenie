import React, { useState, useEffect } from "react";
import logo from "./assets/docgenie-logo.png";

function Loading({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          clearInterval(timer);

          setTimeout(() => {
            if (onFinish) {
              onFinish();
            }
          }, 500);

          return 100;
        }

        return previous + 2;
      });
    }, 35);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="auth-page loading-page">
      <div className="loading-content">

        <div className="logo-circle">
          <img
            src={logo}
            alt="DocGenie"
          />
        </div>

        <h1>DocGenie</h1>

        <p className="loading-tagline">
          Smart Protection. Total Peace of Mind.
        </p>

        <p className="loading-description">
          Secure, organize and access your documents
        </p>

        <div className="loading-bar">
          <div
            className="loading-progress"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span className="loading-text">
          Loading your secure experience...
        </span>

      </div>
    </div>
  );
}

export default Loading;