import {
  useEffect,
  useRef,
  useState,
} from "react";

// =====================================================
// AUTHENTICATION PAGES
// =====================================================

import Loading from "./loading.jsx";
import Login from "./login.jsx";
import CreateAccount from "./create-account.jsx";
import VerifyPhone from "./verify-phone.jsx";
import EnterEmail from "./enter-email.jsx";
import VerifyEmail from "./verify-email.jsx";
import CreatePassword from "./create-password.jsx";
import ReviewDetails from "./review-details.jsx";
import AccountCreated from "./account-created.jsx";

// =====================================================
// MAIN APPLICATION PAGES
// =====================================================

import Home from "./home.jsx";
import Profile from "./profile.jsx";
import Documents from "./documents.jsx";
import DocumentDetails from "./document-details.jsx";
import UploadDocument from "./upload-document.jsx";
import ScanDocument from "./scan-document.jsx";
import ShareDocument from "./share-document.jsx";
import Reminders from "./reminders.jsx";

// =====================================================
// CSS
// =====================================================

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
  // PASSWORD
  // Password is kept in state only.
  // DO NOT store plain password in localStorage.
  // =====================================================

  const [password, setPassword] = useState("");


  // =====================================================
  // DOCUMENTS
  //
  // IMPORTANT:
  // Documents are NOT hardcoded anymore.
  //
  // A newly created user starts with:
  //
  // documents = []
  //
  // Documents will be loaded from the backend
  // after successful login.
  // =====================================================

  const [documents, setDocuments] = useState([]);


  // =====================================================
  // EXPIRY STATUS
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


    if (daysRemaining < 0) {
      return {
        type: "expired",
        label: "Expired",
        icon: "🔴",
        className: "expiry-expired",
        daysRemaining,
      };
    }


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


    if (daysRemaining <= 30) {
      return {
        type: "30-days",
        label: `Expiring in ${daysRemaining} days`,
        icon: "🟡",
        className: "expiry-30",
        daysRemaining,
      };
    }


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

  const documentsWithExpiryStatus =
    documents.map((document) => ({
      ...document,
      expiryStatus: getExpiryStatus(
        document.expiry
      ),
    }));


  // =====================================================
  // EXPIRY NOTIFICATIONS
  // =====================================================

  const expiryNotifications =
    documentsWithExpiryStatus.filter(
      (document) => {

        const status =
          document.expiryStatus?.type;

        return (
          status === "expired" ||
          status === "7-days" ||
          status === "30-days" ||
          status === "90-days"
        );
      }
    );


  // =====================================================
  // BROWSER EXPIRY NOTIFICATIONS
  // =====================================================

  const sendExpiryNotifications = () => {

    if (!("Notification" in window)) {
      console.log(
        "Browser notifications are not supported."
      );

      return;
    }


    if (Notification.permission === "default") {

      Notification.requestPermission().then(
        (permission) => {

          if (permission === "granted") {
            showExpiryNotifications();
          }

        }
      );

      return;
    }


    if (Notification.permission === "granted") {
      showExpiryNotifications();
    }
  };


  const showExpiryNotifications = () => {

    expiryNotifications.forEach(
      (document) => {

        const status =
          document.expiryStatus;

        new Notification(
          "DocGenie Expiry Alert",
          {
            body:
              `${document.name}: ${status.label}`,

            icon: "/docgenie-logo.png",
          }
        );
      }
    );
  };


  useEffect(() => {

    const timer = setTimeout(() => {
      sendExpiryNotifications();
    }, 1500);

    return () =>
      clearTimeout(timer);

  }, []);


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

    if (document) {
      setSelectedDocument(document);
    }

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

    const file =
      e.target.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

      alert(
        "Please select an image file."
      );

      return;
    }


    if (file.size > 5 * 1024 * 1024) {

      alert(
        "Please select an image smaller than 5 MB."
      );

      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {

      const image =
        reader.result;

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
  // CREATE PASSWORD
  // =====================================================

  const handleCreatePassword = async (
    newPassword
  ) => {

    try {

      if (!newPassword) {
        alert("Please enter a password.");
        return;
      }


      // Keep password temporarily in state
      setPassword(newPassword);


      // -------------------------------------------------
      // SAVE USER TO BACKEND DATABASE
      // -------------------------------------------------

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: account.name,
            age: account.age,
            phone: account.phone,
            email: account.email,
            password: newPassword,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to create account."
        );

        return;
      }


      // Account successfully saved
      // in backend database.

      navigate("account-created");

    } catch (error) {

      console.error(
        "Account creation error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    }
  };


  // =====================================================
  // LOAD USER DOCUMENTS
  //
  // This function gets documents belonging ONLY
  // to the currently logged-in user.
  // =====================================================

  const loadDocuments = async () => {

    try {

      const token =
        localStorage.getItem(
          "docgenie-token"
        );


      // No token = no authenticated user
      if (!token) {

        setDocuments([]);

        return;
      }


      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        console.error(
          "Unable to load documents:",
          data.message
        );

        setDocuments([]);

        return;
      }


      // Backend should return:
      //
      // {
      //   documents: [...]
      // }

      setDocuments(
        Array.isArray(data.documents)
          ? data.documents
          : []
      );

    } catch (error) {

      console.error(
        "Load documents error:",
        error
      );

      setDocuments([]);
    }
  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (
    credentials
  ) => {

    try {

      const email =
        credentials?.email?.trim();

      const loginPassword =
        credentials?.password;


      if (!email || !loginPassword) {

        alert(
          "Please enter email and password."
        );

        return;
      }


      // -------------------------------------------------
      // CHECK EMAIL + PASSWORD IN BACKEND
      // -------------------------------------------------

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password: loginPassword,
          }),
        }
      );


      const data =
        await response.json();


      // -------------------------------------------------
      // WRONG EMAIL OR PASSWORD
      // -------------------------------------------------

      if (!response.ok) {

        alert(
          data.message ||
          "Invalid email or password."
        );

        return;
      }


      // -------------------------------------------------
      // LOGIN SUCCESSFUL
      // -------------------------------------------------

      const loggedInUser =
        data.user || data;


      setAccount({
        name:
          loggedInUser.name ||
          "",

        age:
          loggedInUser.age ||
          "",

        phone:
          loggedInUser.phone ||
          "",

        email:
          loggedInUser.email ||
          email,
      });


      // Do NOT save password in localStorage.

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );


      // If backend returns a token,
      // save the token.

      if (data.token) {

        localStorage.setItem(
          "docgenie-token",
          data.token
        );
      }


      // -------------------------------------------------
      // LOAD ONLY THIS USER'S DOCUMENTS
      // -------------------------------------------------

      await loadDocuments();


      navigate("home");

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    }
  };


  // =====================================================
  // BIOMETRIC SUPPORT
  // =====================================================

  const isBiometricSupported =
    async () => {

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

  const bufferToBase64 = (
    buffer
  ) => {

    const bytes =
      new Uint8Array(buffer);

    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  };


  // =====================================================
  // BASE64 TO BUFFER
  // =====================================================

  const base64ToBuffer = (
    base64
  ) => {

    const binary =
      atob(base64);

    const bytes =
      new Uint8Array(
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

  const enableBiometric =
    async () => {

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

  const biometricLogin =
    async () => {

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

    localStorage.removeItem(
      "docgenie-token"
    );


    setProfilePic("");


    setAccount({
      name: "",
      age: "",
      phone: "",
      email: "",
    });


    setPassword("");

    setDocuments([]);

    setSelectedDocument(null);

    navigate("login");
  };


  // =====================================================
  // OPEN DOCUMENT
  // =====================================================

  const openDocument = (
    document
  ) => {

    setSelectedDocument(document);

    navigate(
      "document-details"
    );
  };


  // =====================================================
  // ADD DOCUMENT
  //
  // IMPORTANT:
  // Document is now sent to the backend.
  // It is NOT saved in localStorage.
  // =====================================================

  const addDocument = async (
    document
  ) => {

    try {

      const token =
        localStorage.getItem(
          "docgenie-token"
        );


      if (!token) {

        alert(
          "Please login again."
        );

        navigate("login");

        return;
      }


      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(document),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to add document."
        );

        return;
      }


      // -------------------------------------------------
      // BACKEND SUCCESS
      // -------------------------------------------------

      if (data.document) {

        setDocuments(
          (previous) => [
            data.document,
            ...previous,
          ]
        );
      }


      navigate("documents");

    } catch (error) {

      console.error(
        "Add document error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    }
  };


  // =====================================================
  // DELETE DOCUMENT
  //
  // NOTE:
  // Actual backend delete API will be connected
  // when we implement document routes.
  // =====================================================

  const deleteDocument = (
    id
  ) => {

    setDocuments(
      (previous) =>
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


      {/* =================================================
          LOADING
      ================================================= */}

      {page === "loading" && (

        <Loading
          onFinish={() =>
            navigate("login")
          }
        />

      )}


      {/* =================================================
          LOGIN
      ================================================= */}

      {page === "login" && (

        <Login

          onLogin={
            handleLogin
          }

          onCreateAccount={() =>
            navigate(
              "create-account"
            )
          }

          onBiometricLogin={
            biometricLogin
          }

        />

      )}


      {/* =================================================
          CREATE ACCOUNT
      ================================================= */}

      {page === "create-account" && (

        <CreateAccount

          account={account}

          updateAccount={
            updateAccount
          }

          onContinue={() =>
            navigate(
              "verify-phone"
            )
          }

          onLogin={() =>
            navigate("login")
          }

        />

      )}


      {/* =================================================
          VERIFY PHONE
      ================================================= */}

      {page === "verify-phone" && (

        <VerifyPhone

          account={account}

          onContinue={() =>
            navigate(
              "enter-email"
            )
          }

          onBack={() =>
            navigate(
              "create-account"
            )
          }

        />

      )}


      {/* =================================================
          ENTER EMAIL
      ================================================= */}

      {page === "enter-email" && (

        <EnterEmail

          account={account}

          updateAccount={
            updateAccount
          }

          onContinue={() =>
            navigate(
              "verify-email"
            )
          }

          onBack={() =>
            navigate(
              "verify-phone"
            )
          }

        />

      )}


      {/* =================================================
          VERIFY EMAIL
      ================================================= */}

      {page === "verify-email" && (

        <VerifyEmail

          account={account}

          onContinue={() =>
            navigate(
              "create-password"
            )
          }

          onBack={() =>
            navigate(
              "enter-email"
            )
          }

        />

      )}


      {/* =================================================
          CREATE PASSWORD
      ================================================= */}

      {page === "create-password" && (

        <CreatePassword

          account={account}

          updateAccount={
            updateAccount
          }

          onContinue={
            handleCreatePassword
          }

          onBack={() =>
            navigate("verify-email")
          }

        />

      )}


      {/* =================================================
          ACCOUNT CREATED
      ================================================= */}

      {page === "account-created" && (

        <AccountCreated

          account={account}

          onGetStarted={() =>
            navigate("login")
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

          onNavigate={
            navigate
          }

          profilePic={
            profilePic
          }

          onOpenProfilePicker={
            openProfilePicker
          }

          notificationCount={
            expiryNotifications.length
          }

        />

      )}


      {/* =================================================
          PROFILE
      ================================================= */}

      {page === "profile" && (

        <Profile

          account={account}

          onNavigate={
            navigate
          }

          profilePic={
            profilePic
          }

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

          onNavigate={
            navigate
          }

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

          onNavigate={
            navigate
          }

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

          onNavigate={
            navigate
          }

          onUpload={
            addDocument
          }

        />

      )}
      {/* =================================================
    SCAN DOCUMENT
================================================= */}

{page === "scan" && (

  <ScanDocument

    onNavigate={
      navigate
    }

    onUpload={
      addDocument
    }

  />

)}


      {/* =================================================
          SHARE
      ================================================= */}

      {page === "share" && (

        <ShareDocument

          documents={
            documents
          }

          onNavigate={
            navigate
          }

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

          onNavigate={
            navigate
          }

          notificationCount={
            expiryNotifications.length
          }

        />

      )}

    </div>
  );
}


export default App;