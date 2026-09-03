importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAMH7pWSSaYZdFHAYM0EadQRVw6oK4Lkuw",
  authDomain: "docgenie-2eccc.firebaseapp.com",
  projectId: "docgenie-2eccc",
  storageBucket: "docgenie-2eccc.firebasestorage.app",
  messagingSenderId: "135177457344",
  appId: "1:135177457344:web:48a091dc4616798286e725",
});

const messaging = firebase.messaging();

// =====================================================
// BACKGROUND NOTIFICATION
// =====================================================

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle = payload.notification?.title || "DocGenie";

  const notificationOptions = {
    body: payload.notification?.body || "You have a new DocGenie notification.",

    icon: "/docgenie-logo.png",

    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
