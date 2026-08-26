import React, { useRef, useState } from "react";
import {
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function VerifyPhone({
  account,
  onContinue,
  onBack,
}) {
  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
  ]);

  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;

    setOtp(next);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = () => {
    if (otp.join("").length !== 4) {
      alert("Please enter the 4-digit OTP.");
      return;
    }

    onContinue();
  };

  return (
    <div className="auth-page">

      <div className="verification-card">

        <button
          className="back-link"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="step-indicator">
          STEP 2 OF 6
        </div>

        <div className="verification-icon">
          <Phone size={28} />
        </div>

        <h1>Verify Phone Number</h1>

        <p className="auth-subtitle">
          We've sent a 4-digit verification code to
        </p>

        <strong className="masked-contact">
          {account.phone || "your phone number"}
        </strong>

        <div className="otp-container">

          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) =>
                (inputs.current[index] = element)
              }
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
            />
          ))}

        </div>

        <button
          className="primary-button"
          onClick={verify}
        >
          Verify & Continue
          <ArrowRight size={19} />
        </button>

        <button className="resend-button">
          Didn't receive the code? <b>Resend</b>
        </button>

      </div>

    </div>
  );
}

export default VerifyPhone;