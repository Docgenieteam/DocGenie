import React, { useRef } from "react";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  LogOut,
  Camera,
} from "lucide-react";

function Profile({
  account,
  onNavigate,
  onLogout,
  profilePic,
  onProfilePicChange,
  onRemoveProfilePic,
  onEnableBiometric,
  onDisableBiometric,
}) {
  // File input reference
  const fileInputRef = useRef(null);

  // When profile picture is clicked
  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mobile-page profile-page">

      {/* HEADER */}

      <header className="profile-header">

        <button
          type="button"
          className="profile-back-button"
          onClick={() => onNavigate("home")}
        >
          <ArrowLeft size={21} />
        </button>

        <h1>My Profile</h1>

        <div className="profile-header-space" />

      </header>


      {/* CONTENT */}

      <main className="page-content profile-content">

        {/* PROFILE */}

        <section className="profile-intro">

          {/* =====================================
              PROFILE PICTURE
          ====================================== */}

          <div
            className="profile-main-avatar"
            onClick={handleProfileClick}
            style={{
              cursor: "pointer",
              position: "relative",
            }}
          >

            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onProfilePicChange}
              style={{ display: "none" }}
            />


            {/* PROFILE IMAGE */}

            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              <User size={42} />
            )}


            {/* CAMERA */}

            <div className="profile-camera-icon">
              <Camera size={16} />
            </div>

          </div>


          {/* CLICK TEXT */}

          <button
            type="button"
            onClick={handleProfileClick}
            style={{
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
              marginTop: "8px",
            }}
          >
            {profilePic ? "Change Photo" : "Add Profile Photo"}
          </button>


          {/* REMOVE */}

          {profilePic && (
            <button
              type="button"
              onClick={onRemoveProfilePic}
              style={{
                border: "none",
                background: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Remove Photo
            </button>
          )}


          <h2>
            {account?.name || "Your Name"}
          </h2>

          <p>
            DocGenie Account
          </p>

        </section>


        {/* ACCOUNT DETAILS */}

        <section className="profile-section">

          <h3>Account Details</h3>


          {/* NAME */}

          <div className="profile-info-card">

            <div className="profile-info-icon">
              <User size={20} />
            </div>

            <div className="profile-info-text">

              <span>Full Name</span>

              <strong>
                {account?.name || "Not provided"}
              </strong>

            </div>

          </div>


          {/* PHONE */}

          <div className="profile-info-card">

            <div className="profile-info-icon">
              <Phone size={20} />
            </div>

            <div className="profile-info-text">

              <span>Phone Number</span>

              <strong>
                {account?.phone || "Not provided"}
              </strong>

            </div>

          </div>


          {/* EMAIL */}

          <div className="profile-info-card">

            <div className="profile-info-icon">
              <Mail size={20} />
            </div>

            <div className="profile-info-text">

              <span>Email Address</span>

              <strong>
                {account?.email || "Not provided"}
              </strong>

            </div>

          </div>


          {/* AGE */}

          <div className="profile-info-card">

            <div className="profile-info-icon">
              <Calendar size={20} />
            </div>

            <div className="profile-info-text">

              <span>Age</span>

              <strong>
                {account?.age || "Not provided"}
              </strong>

            </div>

          </div>

        </section>


        {/* SECURITY */}

        <section className="profile-security-card">

          <div className="profile-security-icon">
            <ShieldCheck size={24} />
          </div>

          <div className="profile-security-text">

            <strong>
              Your documents are protected
            </strong>

            <span>
              DocGenie keeps your personal
              information secure.
            </span>

          </div>

        </section>

{/* =========================================
    BIOMETRIC LOGIN
========================================= */}

<section className="profile-security-card">

  <div className="profile-security-icon">
    🔐
  </div>

  <div className="profile-security-text">

    <strong>
      Biometric Login
    </strong>

    <span>
      Use fingerprint or Face ID to login securely.
    </span>

    <button
      type="button"
      onClick={onEnableBiometric}
      style={{
        marginTop: "10px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      Enable Biometric Login
    </button>

    <button
      type="button"
      onClick={onDisableBiometric}
      style={{
        marginTop: "6px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Disable Biometric
    </button>

  </div>

</section>


        {/* LOGOUT */}

        <button
          type="button"
          className="profile-logout-button"
          onClick={onLogout}
        >

          <LogOut size={18} />

          <span>
            Logout
          </span>

        </button>


        <div className="bottom-nav-space" />

      </main>


      {/* BOTTOM NAVIGATION */}

      <ProfileBottomNavigation
        onNavigate={onNavigate}
      />

    </div>
  );
}


/* =============================================
   BOTTOM NAVIGATION
============================================= */

function ProfileBottomNavigation({
  onNavigate,
}) {

  return (
    <nav className="bottom-navigation">

      <button
        type="button"
        onClick={() => onNavigate("home")}
      >
        <span>⌂</span>
        <span>Home</span>
      </button>


      <button
        type="button"
        onClick={() => onNavigate("documents")}
      >
        <span>▣</span>
        <span>Documents</span>
      </button>


      <button
        type="button"
        className="nav-add"
        onClick={() => onNavigate("upload")}
      >
        +
      </button>


      <button
        type="button"
        onClick={() => onNavigate("reminders")}
      >
        <span>♧</span>
        <span>Reminders</span>
      </button>


      <button
        type="button"
        className="active"
        onClick={() => onNavigate("profile")}
      >
        <User size={20} />
        <span>Profile</span>
      </button>

    </nav>
  );
}


export default Profile;