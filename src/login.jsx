import React, { useState } from "react";
import logo from "./assets/docgenie-logo.png";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

function Login({ onLogin, onCreateAccount }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // BIOMETRIC / PASSKEY LOGIN
  // =====================================================

  const handleBiometricLogin = async () => {
    try {
      // Check browser support
      if (
        !window.PublicKeyCredential ||
        !navigator.credentials
      ) {
        alert(
          "Biometric authentication is not supported in this browser."
        );
        return;
      }

      // Check if platform biometric/passkey authentication
      // is available
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!available) {
        alert(
          "Biometric authentication is not available on this device."
        );
        return;
      }

      /*
        DEMO biometric authentication.

        In a real production application, the challenge
        must come from your backend server.
      */

      const challenge = new Uint8Array(32);

      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);

      window.crypto.getRandomValues(userId);

      const credential =
        await navigator.credentials.create({
          publicKey: {
            challenge: challenge,

            rp: {
              name: "DocGenie",
            },

            user: {
              id: userId,
              name:
                identifier ||
                "docgenie-user@example.com",
              displayName:
                identifier ||
                "DocGenie User",
            },

            pubKeyCredParams: [
              {
                type: "public-key",
                alg: -7,
              },
              {
                type: "public-key",
                alg: -257,
              },
            ],

            authenticatorSelection: {
              authenticatorAttachment:
                "platform",
              userVerification: "required",
              residentKey: "required",
              requireResidentKey: true,
            },

            timeout: 60000,

            attestation: "none",
          },
        });

      if (credential) {
        // Save that biometric/passkey setup exists
        localStorage.setItem(
          "docgenie-biometric-enabled",
          "true"
        );

        alert(
          "Biometric authentication successful!"
        );

        onLogin();
      }
    } catch (error) {
      console.error(
        "Biometric authentication error:",
        error
      );

      if (error.name === "NotAllowedError") {
        alert(
          "Biometric authentication was cancelled or not allowed."
        );
      } else {
        alert(
          "Biometric authentication failed. Please try again."
        );
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LOGO */}

        <div
          className="auth-logo"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <img
            src={logo}
            alt="DocGenie"
            style={{
              width: "160px",
              height: "160px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* TITLE */}

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Secure • Organize • Access
        </p>

        {/* EMAIL / PHONE */}

        <div className="form-field">
          <label>
            Email or Phone Number
          </label>

          <div className="input-wrapper">
            <Mail size={19} />

            <input
              type="text"
              placeholder="Enter email or phone number"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
            />
          </div>
        </div>

        {/* PASSWORD */}

        <div className="form-field">
          <label>
            Password
          </label>

          <div className="input-wrapper">
            <Lock size={19} />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <button
              type="button"
              className="input-icon-button"
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* FORGOT PASSWORD */}

        <div className="forgot-row">
          <button
            type="button"
            onClick={() =>
              alert(
                "Password recovery will be added later."
              )
            }
          >
            Forgot Password?
          </button>
        </div>

        {/* LOGIN */}

        <button
          type="button"
          className="primary-button"
          onClick={onLogin}
        >
          Login
          <ArrowRight size={19} />
        </button>

        {/* =================================================
            BIOMETRIC LOGIN
        ================================================= */}

        <button
          type="button"
          className="biometric-login-button"
          onClick={handleBiometricLogin}
        >
          <Fingerprint size={22} />

          <span>
            Login with Biometrics
          </span>
        </button>

        {/* DIVIDER */}

        <div className="or-divider">
          <span />
          <p>Or Login with</p>
          <span />
        </div>

        {/* SOCIAL */}

        <div className="social-buttons">

          <button
            type="button"
            onClick={() =>
              alert(
                "Google login will be connected later."
              )
            }
          >
            <Globe size={19} />
            Google
          </button>

          <button
            type="button"
            onClick={() =>
              alert(
                "Apple login will be connected later."
              )
            }
          >
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.39 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.52 4.09zM12.03 7.25C11.88 5.02 13.69 3.18 15.78 3c.29 2.58-2.34 4.5-3.75 4.25z" />
            </svg>

            Apple
          </button>

        </div>

        {/* SIGN UP */}

        <p className="bottom-auth-text">
          Don't have an account?

          <button
            type="button"
            onClick={onCreateAccount}
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;