import React from "react";
import {
  User,
  Calendar,
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function CreateAccount({
  account,
  updateAccount,
  onContinue,
  onLogin,
}) {
  const handleContinue = () => {
    if (
      !account.name ||
      !account.age ||
      !account.phone
    ) {
      alert("Please fill all required details.");
      return;
    }

    if (!/^\d{10}$/.test(account.phone)) {
      alert("Please enter exactly 10 digits for the phone number.");
      return;
    }

    onContinue();
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      updateAccount({
        phone: value,
      });
    }
  };

  return (
    <div className="auth-page">

      <div className="form-card">

        <button
          type="button"
          className="back-link"
          onClick={onLogin}
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <div className="step-indicator">
          STEP 1 OF 6
        </div>

        <h1>Create Your Account</h1>

        <p className="auth-subtitle">
          Let's get your secure account started.
        </p>

        {/* FULL NAME */}
        <div className="form-field">

          <label>Full Name *</label>

          <div className="input-wrapper">

            <User size={19} />

            <input
              type="text"
              placeholder="Enter your full name"
              value={account.name}
              onChange={(e) =>
                updateAccount({
                  name: e.target.value,
                })
              }
            />

          </div>

        </div>

        {/* AGE */}
        <div className="form-field">

          <label>Age *</label>

          <div className="input-wrapper">

            <Calendar size={19} />

            <input
              type="number"
              placeholder="Enter your age"
              value={account.age}
              min="1"
              max="120"
              onChange={(e) =>
                updateAccount({
                  age: e.target.value,
                })
              }
            />

          </div>

        </div>

        {/* PHONE NUMBER */}
        <div className="form-field">

          <label>Phone Number *</label>

          <div className="input-wrapper">

            <Phone size={19} />

            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter 10-digit phone number"
              value={account.phone}
              maxLength={10}
              onChange={handlePhoneChange}
            />

          </div>

          <small
            style={{
              display: "block",
              marginTop: "6px",
              color: "#777",
              fontSize: "12px",
            }}
          >
            Enter exactly 10 digits
          </small>

        </div>

        {/* CONTINUE */}
        <button
          type="button"
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

export default CreateAccount;