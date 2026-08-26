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

    onContinue();
  };

  return (
    <div className="auth-page">

      <div className="form-card">

        <button
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

        <div className="form-field">

          <label>Age *</label>

          <div className="input-wrapper">
            <Calendar size={19} />

            <input
              type="number"
              placeholder="Enter your age"
              value={account.age}
              onChange={(e) =>
                updateAccount({
                  age: e.target.value,
                })
              }
            />
          </div>

        </div>

        <div className="form-field">

          <label>Phone Number *</label>

          <div className="input-wrapper">

            <Phone size={19} />

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={account.phone}
              onChange={(e) =>
                updateAccount({
                  phone: e.target.value,
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

export default CreateAccount;