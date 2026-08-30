import {
  useEffect,
  useRef,
  useState,
} from "react";

// =====================================================
// FIREBASE
// =====================================================

import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

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


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyAMH7pWSSaYZdFHAYM0EadQRVw6oK4Lkuw",
  authDomain: "docgenie-2eccc.firebaseapp.com",
  projectId: "docgenie-2eccc",
  storageBucket: "docgenie-2eccc.firebasestorage.app",
  messagingSenderId: "135177457344",
  appId: "1:135177457344:web:48a091dc4616798286e725",
  measurementId: "G-E5SWWERQ82",
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const firebaseApp = initializeApp(firebaseConfig);


// =====================================================
// FIREBASE CLOUD MESSAGING
// =====================================================

let messaging = null;

try {
  messaging = getMessaging(firebaseApp);
} catch (error) {
  console.error(
    "Firebase Messaging initialization failed:",
    error
  );
}


// =====================================================
// VAPID KEY
//
// IMPORTANT:
// Replace this with the Web Push certificate key
// from Firebase Console.
//
// Firebase Console:
// Project Settings
// → Cloud Messaging
// → Web configuration
// → Web Push certificates
// =====================================================

const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY || "";



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
  // =====================================================

  const [password, setPassword] = useState("");


  // =====================================================
  // DOCUMENTS
  // =====================================================

  const [documents, setDocuments] = useState([]);


  // =====================================================
  // FCM TOKEN
  // =====================================================

  const [fcmToken, setFcmToken] = useState(
    localStorage.getItem("docgenie-fcm-token") || ""
  );


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
        label:
          `Expiring in ${daysRemaining} days`,
        icon: "🟡",
        className: "expiry-30",
        daysRemaining,
      };
    }


    if (daysRemaining <= 90) {
      return {
        type: "90-days",
        label:
          `Expiring in ${daysRemaining} days`,
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
  // REGISTER FCM TOKEN WITH BACKEND
  // =====================================================

  const registerFCMToken = async (token = null) => {

    try {

      const authToken =
        localStorage.getItem(
          "docgenie-token"
        );


      if (!authToken) {
        console.log(
          "No authentication token. FCM token will not be registered."
        );

        return false;
      }


      const tokenToSend =
        token ||
        localStorage.getItem(
          "docgenie-fcm-token"
        );


      if (!tokenToSend) {
        console.log(
          "No FCM token available."
        );

        return false;
      }


      const response = await fetch(
        "http://localhost:5000/api/notifications/fcm-token",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${authToken}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fcmToken: tokenToSend,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        console.error(
          "Unable to register FCM token:",
          data.message
        );

        return false;
      }


      console.log(
        "FCM token registered successfully."
      );

      return true;

    } catch (error) {

      console.error(
        "FCM token registration error:",
        error
      );

      return false;
    }
  };


  // =====================================================
  // REQUEST FCM PERMISSION
  // =====================================================

  const setupFCM = async () => {

    try {

      if (!messaging) {

        console.log(
          "Firebase Messaging is not available."
        );

        return;
      }


      if (!("Notification" in window)) {

        console.log(
          "Browser notifications are not supported."
        );

        return;
      }


      // -------------------------------------------------
      // REQUEST NOTIFICATION PERMISSION
      // -------------------------------------------------

      const permission =
        await Notification.requestPermission();


      if (permission !== "granted") {

        console.log(
          "Notification permission was not granted."
        );

        return;
      }


      // -------------------------------------------------
      // VAPID KEY CHECK
      // -------------------------------------------------

      if (!VAPID_KEY) {

        console.error(
          "Firebase VAPID key is missing."
        );

        return;
      }


      // -------------------------------------------------
      // GET FCM TOKEN
      // -------------------------------------------------

      const token =
        await getToken(
          messaging,
          {
            vapidKey: VAPID_KEY,
          }
        );


      if (!token) {

        console.log(
          "Unable to get FCM registration token."
        );

        return;
      }


      console.log(
        "FCM Token:",
        token
      );


      // -------------------------------------------------
      // SAVE TOKEN LOCALLY
      // -------------------------------------------------

      localStorage.setItem(
        "docgenie-fcm-token",
        token
      );


      setFcmToken(token);


      // -------------------------------------------------
      // SEND TOKEN TO BACKEND
      // -------------------------------------------------

      await registerFCMToken(token);

    } catch (error) {

      console.error(
        "FCM setup error:",
        error
      );
    }
  };


  // =====================================================
  // FOREGROUND FCM MESSAGES
  // =====================================================

  useEffect(() => {

    if (!messaging) {
      return;
    }


    const unsubscribe =
      onMessage(
        messaging,
        (payload) => {

          console.log(
            "FCM foreground message:",
            payload
          );


          const title =
            payload.notification?.title ||
            "DocGenie Expiry Alert";


          const body =
            payload.notification?.body ||
            "You have a document expiry reminder.";


          // -------------------------------------------------
          // SHOW NOTIFICATION WHEN APP IS OPEN
          // -------------------------------------------------

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {

            new Notification(
              title,
              {
                body,
                icon: "/docgenie-logo.png",
              }
            );

          } else {

            // Fallback
            alert(
              `${title}\n\n${body}`
            );

          }

        }
      );


    return () => {
      unsubscribe();
    };

  }, []);


  // =====================================================
  // SETUP FCM AFTER USER LOGIN
  // =====================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "docgenie-token"
      );


    const loggedIn =
      localStorage.getItem(
        "isLoggedIn"
      );


    if (
      token &&
      loggedIn === "true"
    ) {

      setupFCM();

    }

  }, []);


  // =====================================================
  // BROWSER EXPIRY NOTIFICATIONS
  //
  // TEMPORARY LOCAL FALLBACK
  //
  // The actual production expiry notification
  // will come from the backend through FCM.
  // =====================================================

  const sendExpiryNotifications = () => {

    if (!("Notification" in window)) {

      console.log(
        "Browser notifications are not supported."
      );

      return;
    }


    if (
      Notification.permission ===
      "default"
    ) {

      Notification.requestPermission()
        .then((permission) => {

          if (
            permission ===
            "granted"
          ) {

            showExpiryNotifications();

          }

        });

      return;
    }


    if (
      Notification.permission ===
      "granted"
    ) {

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

            icon:
              "/docgenie-logo.png",
          }
        );

      }
    );
  };


  // =====================================================
  // SELECTED DOCUMENT
  // =====================================================

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);


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


    if (
      !file.type.startsWith("image/")
    ) {

      alert(
        "Please select an image file."
      );

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

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

    setAccount(
      (previous) => ({
        ...previous,
        ...data,
      })
    );

  };


  // =====================================================
  // CREATE PASSWORD
  // =====================================================

  const handleCreatePassword =
    async (newPassword) => {

      try {

        if (!newPassword) {

          alert(
            "Please enter a password."
          );

          return;
        }


        setPassword(
          newPassword
        );


        const response =
          await fetch(
            "http://localhost:5000/api/auth/register",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    account.name,

                  age:
                    account.age,

                  phone:
                    account.phone,

                  email:
                    account.email,

                  password:
                    newPassword,
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


        navigate(
          "account-created"
        );

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
  // =====================================================

  const loadDocuments =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "docgenie-token"
          );


        if (!token) {

          setDocuments([]);

          return;
        }


        const response =
          await fetch(
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


        setDocuments(
          Array.isArray(
            data.documents
          )
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

  const handleLogin =
    async (credentials) => {

      try {

        const email =
          credentials?.email?.trim();


        const loginPassword =
          credentials?.password;


        if (
          !email ||
          !loginPassword
        ) {

          alert(
            "Please enter email and password."
          );

          return;
        }


        const response =
          await fetch(
            "http://localhost:5000/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email,
                  password:
                    loginPassword,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          alert(
            data.message ||
            "Invalid email or password."
          );

          return;
        }


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


        localStorage.setItem(
          "isLoggedIn",
          "true"
        );


        if (data.token) {

          localStorage.setItem(
            "docgenie-token",
            data.token
          );

        }


        // -------------------------------------------------
        // LOAD USER DOCUMENTS
        // -------------------------------------------------

        await loadDocuments();


        // -------------------------------------------------
        // SETUP FCM
        //
        // This obtains the device/browser token and
        // sends it to the backend.
        // -------------------------------------------------

        await setupFCM();


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

  const bufferToBase64 =
    (buffer) => {

      const bytes =
        new Uint8Array(buffer);

      let binary = "";


      bytes.forEach(
        (byte) => {
          binary +=
            String.fromCharCode(
              byte
            );
        }
      );


      return btoa(binary);

    };


  // =====================================================
  // BASE64 TO BUFFER
  // =====================================================

  const base64ToBuffer =
    (base64) => {

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
          await
            isBiometricSupported();


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
          await
            navigator.credentials.create({
              publicKey: {

                challenge,

                rp: {
                  name:
                    "DocGenie",
                },

                user: {

                  id:
                    userId,

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
                    type:
                      "public-key",

                    alg:
                      -7,
                  },

                  {
                    type:
                      "public-key",

                    alg:
                      -257,
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

                timeout:
                  60000,

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
          biometricEnabled !==
            "true" ||
          !savedCredential
        ) {

          alert(
            "Please enable biometric login from your Profile first."
          );

          return;

        }


        const supported =
          await
            isBiometricSupported();


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
          await
            navigator.credentials.get({

              publicKey: {

                challenge,

                allowCredentials: [

                  {
                    type:
                      "public-key",

                    id:
                      base64ToBuffer(
                        savedCredential
                      ),
                  },

                ],

                userVerification:
                  "required",

                timeout:
                  60000,

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


    // FCM token is also removed locally.
    // The backend should ideally remove/deactivate it
    // during logout as well.

    localStorage.removeItem(
      "docgenie-fcm-token"
    );


    setProfilePic("");


    setFcmToken("");


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

    setSelectedDocument(
      document
    );


    navigate(
      "document-details"
    );

  };


  // =====================================================
  // ADD DOCUMENT
  // =====================================================

  const addDocument =
    async (document) => {

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


        const response =
          await fetch(
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
                JSON.stringify(
                  document
                ),

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


        if (data.document) {

          setDocuments(
            (previous) => [
              data.document,
              ...previous,
            ]
          );

        }


        navigate(
          "documents"
        );

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
  // =====================================================

  const deleteDocument =
    async (id) => {

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


        const response =
          await fetch(
            `http://localhost:5000/api/documents/${id}`,
            {
              method: "DELETE",

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          alert(
            data.message ||
            "Unable to delete document."
          );


          return;

        }


        setDocuments(
          (previous) =>
            previous.filter(
              (document) =>
                document._id !== id &&
                document.id !== id
            )
        );


        setSelectedDocument(
          null
        );


        navigate(
          "documents"
        );

      } catch (error) {

        console.error(
          "Delete document error:",
          error
        );


        alert(
          "Unable to connect to the server."
        );

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="app-container">

      {/* =================================================
          HIDDEN PROFILE IMAGE INPUT
      ================================================= */}

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
          account={
            account
          }

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
          account={
            account
          }

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
          account={
            account
          }

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
          account={
            account
          }

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
          account={
            account
          }

          updateAccount={
            updateAccount
          }

          onContinue={
            handleCreatePassword
          }

          onBack={() =>
            navigate(
              "verify-email"
            )
          }

        />

      )}


      {/* =================================================
          ACCOUNT CREATED
      ================================================= */}

      {page === "account-created" && (

        <AccountCreated
          account={
            account
          }

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
          account={
            account
          }

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
          account={
            account
          }

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