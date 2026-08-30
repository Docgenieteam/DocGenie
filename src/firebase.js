import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAMH7pWSSaYZdFHAYM0EadQRVw6oK4Lkuw",
  authDomain: "docgenie-2eccc.firebaseapp.com",
  projectId: "docgenie-2eccc",
  storageBucket: "docgenie-2eccc.firebasestorage.app",
  messagingSenderId: "135177457344",
  appId: "1:135177457344:web:48a091dc4616798286e725",
  measurementId: "G-E5SWWERQ82",
};

const app = initializeApp(firebaseConfig);

const initializeMessaging = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log("Firebase Cloud Messaging is not supported in this browser.");

      return null;
    }

    return getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging initialization error:", error);

    return null;
  }
};

export { app, initializeMessaging };
