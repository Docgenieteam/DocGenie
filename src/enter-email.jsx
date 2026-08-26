import React from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function EnterEmail({
  account,
  updateAccount,
  onContinue,
  onBack,
}) {
  const handleContinue = () => {
    if (!account.email) {
      alert("Please enter your email address.");
      return;
    }

    onContinue();
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
          STEP 3 OF 6
        </div>

        <div className="verification-icon">
          <Mail size={28} />
        </div>

        <h1>Enter Your Email</h1>

        <p className="auth-subtitle">
          Add an email address to secure your account.
        </p>

        <div className="form-field">

          <label>Email Address *</label>

          <div className="input-wrapper">

            <Mail size={19} />

            <input
              type="email"
              placeholder="Enter your email address"
              value={account.email}
              onChange={(e) =>
                updateAccount({
                  email: e.target.value,
                })
              }
            />

          </div>

        </div>

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

export default EnterEmail;