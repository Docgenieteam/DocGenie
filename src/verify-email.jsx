import React, { useRef, useState } from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function VerifyEmail({
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

  const changeOtp = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;

    setOtp(next);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const keyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    if (otp.join("").length !== 4) {
      alert("Please enter the 4-digit OTP.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: account.email,
            otp: otp.join(""),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // OTP verified successfully
        onContinue();
      } else {
        alert(data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Verify OTP Error:", error);
      alert("Unable to connect to the server.");
    }
  };

  const resendOTP = async () => {
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
        alert("A new OTP has been sent to your email.");

        setOtp([
          "",
          "",
          "",
          "",
        ]);

        inputs.current[0]?.focus();
      } else {
        alert(data.message || "Unable to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      alert("Unable to connect to the server.");
    }
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
          STEP 4 OF 6
        </div>

        <div className="verification-icon">
          <Mail size={28} />
        </div>

        <h1>Verify Email Address</h1>

        <p className="auth-subtitle">
          We've sent a 4-digit verification code to
        </p>

        <strong className="masked-contact">
          {account.email || "your email"}
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
                changeOtp(e.target.value, index)
              }
              onKeyDown={(e) =>
                keyDown(e, index)
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

        <button
          className="resend-button"
          onClick={resendOTP}
        >
          Didn't receive the code? <b>Resend</b>
        </button>

      </div>

    </div>
  );
}

export default VerifyEmail;