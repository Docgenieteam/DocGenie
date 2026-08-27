import { useRef, useState } from "react";

// Authentication pages
import Loading from "./loading.jsx";
import Login from "./login.jsx";
import CreateAccount from "./create-account.jsx";
import VerifyPhone from "./verify-phone.jsx";
import EnterEmail from "./enter-email.jsx";
import VerifyEmail from "./verify-email.jsx";
import ReviewDetails from "./review-details.jsx";
import AccountCreated from "./account-created.jsx";

// Main application pages
import Home from "./home.jsx";
import Profile from "./profile.jsx";
import Documents from "./documents.jsx";
import DocumentDetails from "./document-details.jsx";
import UploadDocument from "./upload-document.jsx";
import ShareDocument from "./share-document.jsx";
import Reminders from "./reminders.jsx";

// CSS
import "./app.css";
import "./pages.css";


function App() {

  // =====================================================
  // PROFILE PICTURE
  // =====================================================

  const profileInputRef = useRef(null);

  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("docgenie-profile-pic") || ""
  );


  // =====================================================
  // CURRENT PAGE
  // =====================================================

  const [page, setPage] = useState("loading");


  // =====================================================
  // ACCOUNT
  // =====================================================

  const [account, setAccount] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
  });


  // =====================================================
  // DOCUMENTS
  // =====================================================

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Aadhaar Card",
      category: "Identity",
      date: "12 May 2024",
      icon: "identity",
      color: "blue",
      expiry: "2026-08-25",
      description: "Aadhaar identity document",
    },

    {
      id: 2,
      name: "PAN Card",
      category: "Financial",
      date: "10 Apr 2024",
      icon: "financial",
      color: "blue",
      expiry: "",
      description: "Permanent Account Number card",
    },

    {
      id: 3,
      name: "Passport",
      category: "Identity",
      date: "26 Apr 2024",
      icon: "passport",
      color: "blue",
      expiry: "2034-04-12",
      description: "Indian passport",
    },

    {
      id: 4,
      name: "10th Marksheet",
      category: "Education",
      date: "10 Apr 2024",
      icon: "education",
      color: "red",
      expiry: "",
      description: "10th standard marksheet",
    },

    {
      id: 5,
      name: "Health Insurance",
      category: "Health",
      date: "02 Apr 2024",
      icon: "health",
      color: "red",
      expiry: "",
      description: "Health insurance document",
    },

    {
      id: 6,
      name: "Property Deed",
      category: "Property",
      date: "28 Mar 2024",
      icon: "property",
      color: "orange",
      expiry: "",
      description: "Property ownership document",
    },
  ]);


  // =====================================================
  // EXPIRY STATUS CALCULATION
  // =====================================================

  const getExpiryStatus = (expiry) => {

    if (!expiry) {
      return {
        type: "none",
        label: "No upcoming expiry",
        icon: "✅",
        className: "expiry-none",
        daysRemaining: null,
      };
    }


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const parts = expiry.split("-");

    if (parts.length !== 3) {
      return {
        type: "none",
        label: "No upcoming expiry",
        icon: "✅",
        className: "expiry-none",
        daysRemaining: null,
      };
    }


    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);


    const expiryDate = new Date(
      year,
      month,
      day
    );

    expiryDate.setHours(0, 0, 0, 0);


    const difference =
      expiryDate.getTime() -
      today.getTime();


    const daysRemaining = Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );


    // EXPIRED
    if (daysRemaining < 0) {
      return {
        type: "expired",
        label: "Expired",
        icon: "🔴",
        className: "expiry-expired",
        daysRemaining,
      };
    }


    // WITHIN 7 DAYS
    if (daysRemaining <= 7) {
      return {
        type: "7-days",
        label:
          daysRemaining === 0
            ? "Expires today"
            : `Expiring in ${daysRemaining} day${
                daysRemaining === 1 ? "" : "s"
              }`,
        icon: "🟠",
        className: "expiry-7",
        daysRemaining,
      };
    }


    // WITHIN 30 DAYS
    if (daysRemaining <= 30) {
      return {
        type: "30-days",
        label: `Expiring in ${daysRemaining} days`,
        icon: "🟡",
        className: "expiry-30",
        daysRemaining,
      };
    }


    // WITHIN 90 DAYS
    if (daysRemaining <= 90) {
      return {
        type: "90-days",
        label: `Expiring in ${daysRemaining} days`,
        icon: "🔵",
        className: "expiry-90",
        daysRemaining,
      };
    }


    return {
      type: "none",
      label: "No upcoming expiry",
      icon: "✅",
      className: "expiry-none",
      daysRemaining,
    };
  };


  // =====================================================
  // DOCUMENTS WITH EXPIRY STATUS
  // =====================================================

  const documentsWithExpiryStatus = documents.map(
    (document) => ({
      ...document,
      expiryStatus: getExpiryStatus(
        document.expiry
      ),
    })
  );


  // =====================================================
  // SELECTED DOCUMENT
  // =====================================================

  const [selectedDocument, setSelectedDocument] =
    useState(null);


  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = (
    nextPage,
    document = null
  ) => {

    /*
      When Home search sends:

      onNavigate(
        "document-details",
        document
      )

      this stores that exact document.
    */

    if (
      nextPage === "document-details" &&
      document
    ) {
      setSelectedDocument(document);
    }

    /*
      If another page is opened without
      a document, don't overwrite the
      currently selected document.
    */

    setPage(nextPage);


    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };


  // =====================================================
  // PROFILE PICTURE CHANGE
  // =====================================================

  const handleProfilePicChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Please select an image smaller than 5 MB."
      );
      return;
    }


    const reader = new FileReader();


    reader.onload = () => {

      const image = reader.result;

      setProfilePic(image);

      localStorage.setItem(
        "docgenie-profile-pic",
        image
      );
    };


    reader.onerror = () => {

      alert(
        "Unable to read the selected image."
      );
    };


    reader.readAsDataURL(file);

    e.target.value = "";
  };


  // =====================================================
  // OPEN PROFILE PICKER
  // =====================================================

  const openProfilePicker = () => {

    profileInputRef.current?.click();
  };


  // =====================================================
  // REMOVE PROFILE PICTURE
  // =====================================================

  const removeProfilePic = () => {

    setProfilePic("");

    localStorage.removeItem(
      "docgenie-profile-pic"
    );
  };


  // =====================================================
  // UPDATE ACCOUNT
  // =====================================================

  const updateAccount = (data) => {

    setAccount((previous) => ({
      ...previous,
      ...data,
    }));
  };


  // =====================================================
  // BIOMETRIC SUPPORT
  // =====================================================

  const isBiometricSupported = async () => {

    try {

      if (
        !window.PublicKeyCredential ||
        !navigator.credentials
      ) {
        return false;
      }


      if (
        PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable
      ) {
        return await
          PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable();
      }


      return false;

    } catch (error) {

      console.error(
        "Biometric support error:",
        error
      );

      return false;
    }
  };


  // =====================================================
  // BUFFER TO BASE64
  // =====================================================

  const bufferToBase64 = (buffer) => {

    const bytes = new Uint8Array(buffer);

    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  };


  // =====================================================
  // BASE64 TO BUFFER
  // =====================================================

  const base64ToBuffer = (base64) => {

    const binary = atob(base64);

    const bytes = new Uint8Array(
      binary.length
    );


    for (
      let i = 0;
      i < binary.length;
      i++
    ) {
      bytes[i] =
        binary.charCodeAt(i);
    }


    return bytes;
  };


  // =====================================================
  // ENABLE BIOMETRIC
  // =====================================================

  const enableBiometric = async () => {

    try {

      const supported =
        await isBiometricSupported();


      if (!supported) {

        alert(
          "Biometric authentication is not available on this device or browser."
        );

        return;
      }


      const challenge =
        crypto.getRandomValues(
          new Uint8Array(32)
        );


      const userId =
        crypto.getRandomValues(
          new Uint8Array(16)
        );


      const credential =
        await navigator.credentials.create({
          publicKey: {

            challenge,

            rp: {
              name: "DocGenie",
            },

            user: {

              id: userId,

              name:
                account.email ||
                account.phone ||
                "docgenie-user",

              displayName:
                account.name ||
                "DocGenie User",
            },

            pubKeyCredParams: [

              {
                type: "public-key",
                alg: -7,
              },

              {
                type: "public-key",
                alg: -257,
              },

            ],

            authenticatorSelection: {

              authenticatorAttachment:
                "platform",

              userVerification:
                "required",

              residentKey:
                "preferred",
            },

            timeout: 60000,

            attestation:
              "none",
          },
        });


      if (!credential) {

        alert(
          "Biometric setup was cancelled."
        );

        return;
      }


      const credentialId =
        bufferToBase64(
          credential.rawId
        );


      localStorage.setItem(
        "docgenie-biometric-enabled",
        "true"
      );


      localStorage.setItem(
        "docgenie-biometric-credential",
        credentialId
      );


      alert(
        "Biometric login enabled successfully!"
      );

    } catch (error) {

      console.error(
        "Biometric registration error:",
        error
      );

      alert(
        "Biometric setup failed or was cancelled."
      );
    }
  };


  // =====================================================
  // BIOMETRIC LOGIN
  // =====================================================

  const biometricLogin = async () => {

    try {

      const biometricEnabled =
        localStorage.getItem(
          "docgenie-biometric-enabled"
        );


      const savedCredential =
        localStorage.getItem(
          "docgenie-biometric-credential"
        );


      if (
        biometricEnabled !== "true" ||
        !savedCredential
      ) {

        alert(
          "Please enable biometric login from your Profile first."
        );

        return;
      }


      const supported =
        await isBiometricSupported();


      if (!supported) {

        alert(
          "Biometric authentication is not available on this device or browser."
        );

        return;
      }


      const challenge =
        crypto.getRandomValues(
          new Uint8Array(32)
        );


      const credential =
        await navigator.credentials.get({

          publicKey: {

            challenge,

            allowCredentials: [

              {
                type: "public-key",

                id:
                  base64ToBuffer(
                    savedCredential
                  ),
              },

            ],

            userVerification:
              "required",

            timeout: 60000,
          },
        });


      if (!credential) {

        alert(
          "Biometric authentication failed."
        );

        return;
      }


      navigate("home");

    } catch (error) {

      console.error(
        "Biometric login error:",
        error
      );

      alert(
        "Biometric authentication failed or was cancelled."
      );
    }
  };


  // =====================================================
  // DISABLE BIOMETRIC
  // =====================================================

  const disableBiometric = () => {

    localStorage.removeItem(
      "docgenie-biometric-enabled"
    );

    localStorage.removeItem(
      "docgenie-biometric-credential"
    );


    alert(
      "Biometric login has been disabled."
    );
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "docgenie-profile-pic"
    );


    setProfilePic("");


    setAccount({
      name: "",
      age: "",
      phone: "",
      email: "",
    });


    setSelectedDocument(null);


    navigate("login");
  };


  // =====================================================
  // OPEN DOCUMENT FROM DOCUMENTS PAGE
  // =====================================================

  const openDocument = (document) => {

    setSelectedDocument(document);

    navigate("document-details");
  };


  // =====================================================
  // ADD DOCUMENT
  // =====================================================

  const addDocument = (document) => {

    const newDocument = {

      ...document,

      id: Date.now(),
    };


    setDocuments((previous) => [

      newDocument,

      ...previous,
    ]);


    try {

      const existingDocuments =
        JSON.parse(
          localStorage.getItem(
            "docgenie-documents"
          ) || "[]"
        );


      localStorage.setItem(

        "docgenie-documents",

        JSON.stringify([

          newDocument,

          ...existingDocuments,
        ])
      );

    } catch (error) {

      console.error(
        "Could not save document:",
        error
      );
    }


    navigate("documents");
  };


  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const deleteDocument = (id) => {

    setDocuments((previous) =>
      previous.filter(
        (document) =>
          document.id !== id
      )
    );


    setSelectedDocument(null);

    navigate("documents");
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="app-container">


      {/* HIDDEN PROFILE IMAGE INPUT */}

      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        onChange={
          handleProfilePicChange
        }
        style={{
          display: "none",
        }}
      />


      {/* LOADING */}

      {page === "loading" && (

        <Loading
          onFinish={() =>
            navigate("login")
          }
        />

      )}


      {/* LOGIN */}

      {page === "login" && (

        <Login

          onLogin={() =>
            navigate("home")
          }

          onCreateAccount={() =>
            navigate("create-account")
          }

          onBiometricLogin={
            biometricLogin
          }

        />

      )}


      {/* CREATE ACCOUNT */}

      {page === "create-account" && (

        <CreateAccount

          account={account}

          updateAccount={
            updateAccount
          }

          onContinue={() =>
            navigate("verify-phone")
          }

          onLogin={() =>
            navigate("login")
          }

        />

      )}


      {/* VERIFY PHONE */}

      {page === "verify-phone" && (

        <VerifyPhone

          account={account}

          onContinue={() =>
            navigate("enter-email")
          }

          onBack={() =>
            navigate("create-account")
          }

        />

      )}


      {/* ENTER EMAIL */}

      {page === "enter-email" && (

        <EnterEmail

          account={account}

          updateAccount={
            updateAccount
          }

          onContinue={() =>
            navigate("verify-email")
          }

          onBack={() =>
            navigate("verify-phone")
          }

        />

      )}


      {/* VERIFY EMAIL */}

      {page === "verify-email" && (

        <VerifyEmail

          account={account}

          onContinue={() =>
            navigate("review-details")
          }

          onBack={() =>
            navigate("enter-email")
          }

        />

      )}


      {/* REVIEW DETAILS */}

      {page === "review-details" && (

        <ReviewDetails

          account={account}

          onCreate={() =>
            navigate("account-created")
          }

          onBack={() =>
            navigate("verify-email")
          }

        />

      )}


      {/* ACCOUNT CREATED */}

      {page === "account-created" && (

        <AccountCreated

          account={account}

          onGetStarted={() =>
            navigate("home")
          }

        />

      )}


      {/* =================================================
          HOME
      ================================================= */}

      {page === "home" && (

        <Home

          account={account}

          documents={
            documentsWithExpiryStatus
          }

          onNavigate={navigate}

          profilePic={profilePic}

          onOpenProfilePicker={
            openProfilePicker
          }

        />

      )}


      {/* =================================================
          PROFILE
      ================================================= */}

      {page === "profile" && (

        <Profile

          account={account}

          onNavigate={navigate}

          profilePic={profilePic}

          onProfilePicChange={
            handleProfilePicChange
          }

          onOpenProfilePicker={
            openProfilePicker
          }

          onRemoveProfilePic={
            removeProfilePic
          }

          onLogout={
            handleLogout
          }

          onEnableBiometric={
            enableBiometric
          }

          onDisableBiometric={
            disableBiometric
          }

        />

      )}


      {/* =================================================
          DOCUMENTS
      ================================================= */}

      {page === "documents" && (

        <Documents

          documents={
            documentsWithExpiryStatus
          }

          onNavigate={navigate}

          onOpenDocument={
            openDocument
          }

        />

      )}


      {/* =================================================
          DOCUMENT DETAILS
      ================================================= */}

      {page === "document-details" && (

        <DocumentDetails

          document={
            selectedDocument
              ? {
                  ...selectedDocument,

                  expiryStatus:
                    getExpiryStatus(
                      selectedDocument.expiry
                    ),
                }
              : null
          }

          onNavigate={navigate}

          onDelete={
            deleteDocument
          }

        />

      )}


      {/* =================================================
          UPLOAD
      ================================================= */}

      {page === "upload" && (

        <UploadDocument

          onNavigate={navigate}

          onUpload={addDocument}

        />

      )}


      {/* =================================================
          SHARE
      ================================================= */}

      {page === "share" && (

        <ShareDocument

          documents={documents}

          onNavigate={navigate}

        />

      )}


      {/* =================================================
          REMINDERS
      ================================================= */}

      {page === "reminders" && (

        <Reminders

          documents={
            documentsWithExpiryStatus
          }

          onNavigate={navigate}

        />

      )}

    </div>
  );
}


export default App;