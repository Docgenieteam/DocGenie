import React from "react";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function AccountCreated({ onGetStarted }) {
  return (
    <div className="auth-page success-page">

      <div className="success-card">

        <div className="success-icon">
          <CheckCircle2 size={48} />
        </div>

        <div className="step-indicator">
          STEP 6 OF 6
        </div>

        <h1>Account Created!</h1>

        <p className="auth-subtitle">
          Your DocGenie account has been
          successfully created.
        </p>

        <div className="secure-box">
          <ShieldCheck size={22} />

          <span>
            Your information is securely protected.
          </span>
        </div>

        <button
          className="primary-button"
          onClick={onGetStarted}
        >
          Get Started
          <ArrowRight size={19} />
        </button>

      </div>

    </div>
  );
}

export default AccountCreated;