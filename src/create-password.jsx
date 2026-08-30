import React, { useState } from "react";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

function CreatePassword({
  account,
  updateAccount,
  onContinue,
  onBack,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleContinue = () => {
    if (!password) {
      alert("Please create a password.");
      return;
    }

    if (password.length < 8) {
      alert(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Save password temporarily in account state
    // It will be sent to backend after this step.
    updateAccount({
      password: password,
    });

    onContinue(password);
  };

  return (
    <div className="auth-page">

      <div className="form-card">

        <button
          className="back-link"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="step-indicator">
          STEP 5 OF 7
        </div>

        <div className="verification-icon">
          <Lock size={28} />
        </div>

        <h1>Create Password</h1>

        <p className="auth-subtitle">
          Create a strong password to protect your
          DocGenie account.
        </p>

        {/* PASSWORD */}

        <div className="form-field">

          <label>Password *</label>

          <div className="input-wrapper">

            <Lock size={19} />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Create your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>

          </div>

        </div>

        {/* CONFIRM PASSWORD */}

        <div className="form-field">

          <label>
            Confirm Password *
          </label>

          <div className="input-wrapper">

            <Lock size={19} />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>

          </div>

        </div>

        <p
          style={{
            fontSize: "13px",
            marginTop: "8px",
            opacity: 0.7,
          }}
        >
          Password must contain at least 8 characters.
        </p>

        <button
          className="primary-button"
          onClick={handleContinue}
        >
          Continue
          <ArrowRight size={19} />
        </button>

      </div>

    </div>
  );
}

export default CreatePassword;