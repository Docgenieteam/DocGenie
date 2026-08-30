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
  const handleContinue = async () => {
    if (!account.email) {
      alert("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: account.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // OTP sent successfully
        onContinue();
      } else {
        alert(data.message || "Unable to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      alert("Unable to connect to the server.");
    }
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