import {
  useEffect,
  useRef,
  useState,
} from "react";

// =====================================================
// FIREBASE
// =====================================================

import {
  getToken,
  onMessage,
} from "firebase/messaging";

import {
  messaging,
  initializeMessaging,
} from "./firebase";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://docgenie-xle5.onrender.com"
    : "http://localhost:5000");

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
import ShareDocument from "./share-document.jsx";
import Reminders from "./reminders.jsx";

// =====================================================
// SCAN DOCUMENT
// =====================================================

import ScanDocument from "./scan-document.jsx";

// =====================================================
// CSS
// =====================================================

import "./app.css";
import "./pages.css";

function App() {
  // =====================================================
  // PROFILE PICTURE
  // =====================================================

  const profileInputRef =
    useRef(null);

  const [profilePic, setProfilePic] =
    useState(
      localStorage.getItem(
        "docgenie-profile-pic"
      ) || ""
    );

  // =====================================================
  // CURRENT PAGE
  // =====================================================

  const [page, setPage] =
    useState("loading");

  // =====================================================
  // ACCOUNT
  // =====================================================

  const [account, setAccount] =
    useState({
      name: "",
      age: "",
      phone: "",
      email: "",
    });

  // =====================================================
  // PASSWORD
  // =====================================================

  const [password, setPassword] =
    useState("");

  // =====================================================
  // DOCUMENTS
  // =====================================================

  const [documents, setDocuments] =
    useState([]);

  // =====================================================
  // SELECTED DOCUMENT
  // =====================================================

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);

  // =====================================================
  // AUTH TOKEN HELPER
  // =====================================================

  const getAuthToken = () => {
    return (
      localStorage.getItem(
        "docgenie-token"
      ) ||
      localStorage.getItem(
        "token"
      ) ||
      sessionStorage.getItem(
        "docgenie-token"
      ) ||
      sessionStorage.getItem(
        "token"
      )
    );
  };

  // =====================================================
  // SAVE AUTH TOKEN
  // =====================================================

  const saveAuthToken = (token) => {
    if (!token) {
      return false;
    }

    localStorage.setItem(
      "docgenie-token",
      token
    );

    // Compatibility with older code
    localStorage.setItem(
      "token",
      token
    );

    return true;
  };

  // =====================================================
  // EXPIRY STATUS
  // =====================================================

  const getExpiryStatus = (
    expiry
  ) => {
    if (!expiry) {
      return {
        type: "none",
        label: "No upcoming expiry",
        icon: "✅",
        className:
          "expiry-none",
        daysRemaining: null,
      };
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const parts =
      expiry.split("-");

    if (parts.length !== 3) {
      return {
        type: "none",
        label: "No upcoming expiry",
        icon: "✅",
        className:
          "expiry-none",
        daysRemaining: null,
      };
    }

    const year =
      Number(parts[0]);

    const month =
      Number(parts[1]) - 1;

    const day =
      Number(parts[2]);

    const expiryDate =
      new Date(
        year,
        month,
        day
      );

    expiryDate.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      expiryDate.getTime() -
      today.getTime();

    const daysRemaining =
      Math.ceil(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );

    if (
      daysRemaining < 0
    ) {
      return {
        type: "expired",
        label: "Expired",
        icon: "🔴",
        className:
          "expiry-expired",
        daysRemaining,
      };
    }

    if (
      daysRemaining <= 7
    ) {
      return {
        type: "7-days",
        label:
          daysRemaining === 0
            ? "Expires today"
            : `Expiring in ${daysRemaining} day${
                daysRemaining === 1
                  ? ""
                  : "s"
              }`,
        icon: "🟠",
        className:
          "expiry-7",
        daysRemaining,
      };
    }

    if (
      daysRemaining <= 30
    ) {
      return {
        type: "30-days",
        label: `Expiring in ${daysRemaining} days`,
        icon: "🟡",
        className:
          "expiry-30",
        daysRemaining,
      };
    }

    if (
      daysRemaining <= 90
    ) {
      return {
        type: "90-days",
        label: `Expiring in ${daysRemaining} days`,
        icon: "🔵",
        className:
          "expiry-90",
        daysRemaining,
      };
    }

    return {
      type: "none",
      label: "No upcoming expiry",
      icon: "✅",
      className:
        "expiry-none",
      daysRemaining,
    };
  };

  // =====================================================
  // DOCUMENTS WITH EXPIRY STATUS
  // =====================================================

  const documentsWithExpiryStatus =
    documents.map(
      (document) => ({
        ...document,

        expiryStatus:
          getExpiryStatus(
            document.expiry
          ),
      })
    );

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
  // SAVE FCM TOKEN TO BACKEND
  // =====================================================

  const registerFCMToken =
    async () => {
      try {
        const token =
          getAuthToken();

        if (!token) {
          console.log(
            "FCM: User is not logged in."
          );

          return;
        }

        // -------------------------------------------------
        // INITIALIZE FIREBASE MESSAGING
        // -------------------------------------------------

        const firebaseMessaging =
          await initializeMessaging();

        if (!firebaseMessaging) {
          console.warn(
            "FCM: Firebase Messaging is not available."
          );

          return;
        }

        if (
          !("Notification" in window)
        ) {
          console.log(
            "FCM: Browser notifications are not supported."
          );

          return;
        }

        const vapidKey =
          import.meta.env
            .VITE_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
          console.warn(
            "FCM disabled: VITE_FIREBASE_VAPID_KEY is missing."
          );

          return;
        }

        let permission =
          Notification.permission;

        if (
          permission ===
          "default"
        ) {
          permission =
            await Notification.requestPermission();
        }

        if (
          permission !==
          "granted"
        ) {
          console.log(
            "FCM: Notification permission was not granted."
          );

          return;
        }

        // -------------------------------------------------
        // REGISTER FIREBASE SERVICE WORKER
        // -------------------------------------------------

        const registration =
          await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

        console.log(
          "FCM: Firebase service worker registered."
        );

        // -------------------------------------------------
        // GET FCM TOKEN
        // -------------------------------------------------

        const fcmToken =
          await getToken(
            firebaseMessaging,
            {
              vapidKey,

              serviceWorkerRegistration:
                registration,
            }
          );

        if (!fcmToken) {
          console.log(
            "FCM: Unable to get FCM token."
          );

          return;
        }

        console.log(
          "FCM token received successfully."
        );

        // -------------------------------------------------
        // SAVE TOKEN TO BACKEND
        // -------------------------------------------------

        const response =
          await fetch(
            `${API_URL}/api/notifications/fcm-token`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                token: fcmToken,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          console.error(
            "FCM token save failed:",
            data
          );

          return;
        }

        // -------------------------------------------------
        // SAVE TOKEN LOCALLY
        // -------------------------------------------------

        localStorage.setItem(
          "docgenie-fcm-token",
          fcmToken
        );

        console.log(
          "FCM token saved successfully."
        );
      } catch (error) {
        console.error(
          "FCM registration error:",
          error
        );
      }
    };

  // =====================================================
  // FCM FOREGROUND MESSAGE
  // =====================================================

  useEffect(() => {
    let unsubscribe;

    const setupForegroundMessaging =
      async () => {
        try {
          const firebaseMessaging =
            await initializeMessaging();

          if (!firebaseMessaging) {
            return;
          }

          if (
            !("Notification" in window)
          ) {
            return;
          }

          unsubscribe =
            onMessage(
              firebaseMessaging,
              (payload) => {
                console.log(
                  "FCM foreground message:",
                  payload
                );

                const title =
                  payload.notification?.title ||
                  "DocGenie";

                const body =
                  payload.notification?.body ||
                  "You have a new notification.";

                if (
                  Notification.permission ===
                  "granted"
                ) {
                  new Notification(
                    title,
                    {
                      body,

                      icon:
                        `${import.meta.env.BASE_URL}docgenie-logo.png`,
                    }
                  );
                } else {
                  console.log(
                    `${title}: ${body}`
                  );
                }
              }
            );
        } catch (error) {
          console.error(
            "FCM foreground listener error:",
            error
          );
        }
      };

    setupForegroundMessaging();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // =====================================================
  // REGISTER FCM WHEN USER IS LOGGED IN
  // =====================================================

  useEffect(() => {
    if (
      page !== "home" &&
      page !== "documents" &&
      page !== "profile" &&
      page !== "reminders"
    ) {
      return;
    }

    if (!account.email) {
      return;
    }

    registerFCMToken();
  }, [
    page,
    account.email,
  ]);

  // =====================================================
  // BROWSER EXPIRY NOTIFICATIONS
  // =====================================================

  const sendExpiryNotifications =
    () => {
      if (
        !("Notification" in window)
      ) {
        console.log(
          "Browser notifications are not supported."
        );

        return;
      }

      if (
        Notification.permission ===
        "default"
      ) {
        Notification.requestPermission().then(
          (permission) => {
            if (
              permission ===
              "granted"
            ) {
              showExpiryNotifications();
            }
          }
        );

        return;
      }

      if (
        Notification.permission ===
        "granted"
      ) {
        showExpiryNotifications();
      }
    };

  const showExpiryNotifications =
    () => {
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
                `${import.meta.env.BASE_URL}docgenie-logo.png`,
            }
          );
        }
      );
    };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = (
    nextPage,
    document = null
  ) => {
    if (document) {
      setSelectedDocument(
        document
      );
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

  const handleProfilePicChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
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

  const openProfilePicker =
    () => {
      profileInputRef.current?.click();
    };

  // =====================================================
  // REMOVE PROFILE PICTURE
  // =====================================================

  const removeProfilePic =
    () => {
      setProfilePic("");

      localStorage.removeItem(
        "docgenie-profile-pic"
      );
    };

  // =====================================================
  // UPDATE ACCOUNT
  // =====================================================

  const updateAccount = (
    data
  ) => {
    setAccount(
      (previous) => ({
        ...previous,
        ...data,
      })
    );
  };

  // =====================================================
  // LOAD USER DOCUMENTS
  // =====================================================

  const loadDocuments =
    async () => {
      try {
        const token =
          getAuthToken();

        if (!token) {
          setDocuments([]);

          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/documents`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          console.error(
            "Authentication expired while loading documents."
          );

          return;
        }

        if (!response.ok) {
          console.error(
            "Unable to load documents:",
            data
          );

          setDocuments([]);

          return;
        }

        setDocuments(
          data.documents || []
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
  // CREATE ACCOUNT
  // =====================================================

  const handleCreatePassword =
    async (
      newPassword
    ) => {
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
            `${API_URL}/api/auth/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
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

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

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
  // LOGIN
  // =====================================================

  const handleLogin =
    async (
      credentials
    ) => {
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
            `${API_URL}/api/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,

                password:
                  loginPassword,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        // -------------------------------------------------
        // SAFE LOGIN RESPONSE DEBUG
        // Does NOT print the actual token.
        // -------------------------------------------------

        console.log(
          "LOGIN RESPONSE:",
          {
            success:
              data.success,

            hasToken:
              Boolean(
                data.token
              ),

            hasAccessToken:
              Boolean(
                data.accessToken
              ),

            hasNestedToken:
              Boolean(
                data.data?.token
              ),

            hasNestedAccessToken:
              Boolean(
                data.data?.accessToken
              ),

            user:
              data.user ||
              data.data?.user,
          }
        );

        if (!response.ok) {
          alert(
            data.message ||
              "Invalid email or password."
          );

          return;
        }

        // -------------------------------------------------
        // FIND AUTH TOKEN
        // -------------------------------------------------

        const token =
          data.token ||
          data.accessToken ||
          data.data?.token ||
          data.data?.accessToken;

        if (!token) {
          console.error(
            "Login succeeded but no authentication token was returned."
          );

          alert(
            "Login succeeded, but the server did not return an authentication token."
          );

          return;
        }

        // -------------------------------------------------
        // SAVE AUTH TOKEN
        // -------------------------------------------------

        saveAuthToken(
          token
        );

        localStorage.setItem(
          "isLoggedIn",
          "true"
        );

        // -------------------------------------------------
        // USER DATA
        // -------------------------------------------------

        const loggedInUser =
          data.user ||
          data.data?.user ||
          data;

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

        // -------------------------------------------------
        // LOAD DOCUMENTS
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
  // DELETE DOCUMENT
  // =====================================================

  const deleteDocument =
    async (
      documentId
    ) => {
      try {
        if (!documentId) {
          alert(
            "Document ID is missing."
          );

          return;
        }

        const token =
          getAuthToken();

        if (!token) {
          alert(
            "Please login again."
          );

          navigate("login");

          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/documents/${documentId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          alert(
            "Your session has expired. Please login again."
          );

          handleLogout();

          return;
        }

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
                document._id !==
                documentId
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
          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
        ) {
          return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
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
          await navigator.credentials.create(
            {
              publicKey: {
                challenge,

                rp: {
                  name:
                    "DocGenie",
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

                authenticatorSelection:
                  {
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
            }
          );

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
          await navigator.credentials.get(
            {
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
            }
          );

        if (!credential) {
          alert(
            "Biometric authentication failed."
          );

          return;
        }

        const token =
          getAuthToken();

        if (!token) {
          alert(
            "Please login with your email and password once before using biometric login."
          );

          return;
        }

        await loadDocuments();

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

  const disableBiometric =
    () => {
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

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "docgenie-fcm-token"
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

    setSelectedDocument(
      null
    );

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

  const addDocument = (
    document
  ) => {
    if (!document) {
      return;
    }

    setDocuments(
      (previous) => [
        document,
        ...previous,
      ]
    );
  };

  // =====================================================
  // SCAN COMPLETE
  // =====================================================

  const handleScanComplete = (
    scannedImage
  ) => {
    if (!scannedImage) {
      return;
    }

    sessionStorage.setItem(
      "docgenie-scanned-document",
      scannedImage
    );

    navigate("upload");
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

          onScanComplete={
            handleScanComplete
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