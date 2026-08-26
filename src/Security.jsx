import React, { useState } from "react";
import logo from "./assets/docgenie-logo.png";
import "./styles.css";

function Security({ onComplete, onBack }) {

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");

  const nextStep = () => {

    if (step === 1) {

      if (!name || !phone) {
        alert("Please enter your name and phone number.");
        return;
      }

    }

    if (step === 2) {

      if (!phoneCode) {
        alert("Please enter the phone verification code.");
        return;
      }

    }

    if (step === 3) {

      if (!email) {
        alert("Please enter your email address.");
        return;
      }

    }

    if (step === 4) {

      if (!emailCode) {
        alert("Please enter the email verification code.");
        return;
      }

    }

    if (step < 6) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const previousStep = () => {

    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="flow-page">

      <div className="flow-background-circle circle-one"></div>
      <div className="flow-background-circle circle-two"></div>

      <div className="flow-card">

        {/* HEADER */}

        <div className="flow-header">

          <img
            src={logo}
            alt="DocGenie"
          />

          <div>
            <h2>DocGenie</h2>
            <p>Smart Document Manager</p>
          </div>

        </div>

        {/* PROGRESS */}

        <div className="flow-progress">

          {[
            "Create",
            "Phone",
            "Email",
            "Verify",
            "Review",
            "Done"
          ].map((label, index) => {

            const number = index + 1;

            return (
              <div
                className="flow-progress-item"
                key={number}
              >

                <div
                  className={
                    number <= step
                      ? "flow-circle active"
                      : "flow-circle"
                  }
                >
                  {number < step
                    ? "✓"
                    : number}
                </div>

                <span>
                  {label}
                </span>

                {number < 6 && (
                  <div
                    className={
                      number < step
                        ? "flow-line active"
                        : "flow-line"
                    }
                  />
                )}

              </div>
            );
          })}

        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <div className="flow-content">

            <span className="flow-step">
              STEP 1 OF 6
            </span>

            <div className="flow-icon">
              👤
            </div>

            <h1>
              Create your account
            </h1>

            <p>
              Enter your basic details to create
              your secure DocGenie account.
            </p>

            <div className="flow-form">

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />

            </div>

          </div>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <div className="flow-content">

            <span className="flow-step">
              STEP 2 OF 6
            </span>

            <div className="flow-icon">
              📱
            </div>

            <h1>
              Verify your phone
            </h1>

            <p>
              We sent a verification code to
              <strong> {phone}</strong>.
            </p>

            <div className="flow-form">

              <label>
                Verification Code
              </label>

              <input
                className="code-input"
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit code"
                value={phoneCode}
                onChange={(e) =>
                  setPhoneCode(e.target.value)
                }
              />

            </div>

            <button
              className="resend-button"
              type="button"
              onClick={() =>
                alert("A new verification code has been sent.")
              }
            >
              Resend code
            </button>

          </div>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <div className="flow-content">

            <span className="flow-step">
              STEP 3 OF 6
            </span>

            <div className="flow-icon">
              ✉️
            </div>

            <h1>
              Enter your email
            </h1>

            <p>
              Add an email address for your
              DocGenie account.
            </p>

            <div className="flow-form">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

          </div>
        )}

        {/* STEP 4 */}

        {step === 4 && (
          <div className="flow-content">

            <span className="flow-step">
              STEP 4 OF 6
            </span>

            <div className="flow-icon">
              🔐
            </div>

            <h1>
              Verify your email
            </h1>

            <p>
              We sent a verification code to
              <strong> {email}</strong>.
            </p>

            <div className="flow-form">

              <label>
                Email Verification Code
              </label>

              <input
                className="code-input"
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit code"
                value={emailCode}
                onChange={(e) =>
                  setEmailCode(e.target.value)
                }
              />

            </div>

            <button
              className="resend-button"
              type="button"
              onClick={() =>
                alert("A new email verification code has been sent.")
              }
            >
              Resend code
            </button>

          </div>
        )}

        {/* STEP 5 */}

        {step === 5 && (
          <div className="flow-content">

            <span className="flow-step">
              STEP 5 OF 6
            </span>

            <div className="flow-icon">
              📋
            </div>

            <h1>
              Review your details
            </h1>

            <p>
              Please check your information
              before creating your account.
            </p>

            <div className="review-box">

              <div>
                <span>Name</span>
                <strong>{name}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{phone}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{email}</strong>
              </div>

            </div>

          </div>
        )}

        {/* STEP 6 */}

        {step === 6 && (
          <div className="flow-content success-content">

            <span className="flow-step">
              STEP 6 OF 6
            </span>

            <div className="success-icon">
              ✓
            </div>

            <h1>
              Account Created!
            </h1>

            <p>
              Your DocGenie account has been
              successfully created.
            </p>

            <div className="success-message">
              🔒 Your account is ready and protected.
            </div>

          </div>
        )}

        {/* BUTTONS */}

        <div className="flow-actions">

          <button
            className="flow-back"
            onClick={previousStep}
          >
            Back
          </button>

          <button
            className="flow-next"
            onClick={nextStep}
          >
            {step === 6
              ? "Go to Home"
              : "Continue →"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Security;