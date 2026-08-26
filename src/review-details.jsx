import React from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function ReviewDetails({
  account,
  onCreate,
  onBack,
}) {
  return (
    <div className="auth-page">

      <div className="review-card">

        <button
          className="back-link"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="step-indicator">
          STEP 5 OF 6
        </div>

        <div className="verification-icon">
          <CheckCircle2 size={28} />
        </div>

        <h1>Review Your Details</h1>

        <p className="auth-subtitle">
          Please check your information before
          creating your account.
        </p>

        <div className="review-list">

          <div className="review-item">
            <User size={19} />
            <div>
              <span>Full Name</span>
              <strong>
                {account.name || "Not provided"}
              </strong>
            </div>
          </div>

          <div className="review-item">
            <Calendar size={19} />
            <div>
              <span>Age</span>
              <strong>
                {account.age || "Not provided"}
              </strong>
            </div>
          </div>

          <div className="review-item">
            <Phone size={19} />
            <div>
              <span>Phone Number</span>
              <strong>
                {account.phone || "Not provided"}
              </strong>
            </div>
          </div>

          <div className="review-item">
            <Mail size={19} />
            <div>
              <span>Email</span>
              <strong>
                {account.email || "Not provided"}
              </strong>
            </div>
          </div>

        </div>

        <button
          className="primary-button"
          onClick={onCreate}
        >
          Create Account
          <ArrowRight size={19} />
        </button>

      </div>

    </div>
  );
}

export default ReviewDetails;