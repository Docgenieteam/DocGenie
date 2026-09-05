import { getToken, onMessage } from "firebase/messaging";

import { initializeMessaging } from "./firebase";

const VAPID_KEY =
  "BN-EdgNFPlY2hkjp__HReyt0IG8Vd6eKnUPI6366N1s8JimIQH7UvELX-i9xMZDo0i2aB9f9xg2mRaUx8vytdiY";

// =====================================================
// GET FCM TOKEN
// =====================================================

export const getFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission was not granted.");

      return null;
    }

    const messaging = await initializeMessaging();

    if (!messaging) {
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}firebase-messaging-sw.js`,
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.log("Unable to obtain FCM token.");

      return null;
    }

    console.log("DocGenie FCM Token:", token);

    return token;
  } catch (error) {
    console.error("FCM token error:", error);

    return null;
  }
};

// =====================================================
// FOREGROUND MESSAGE LISTENER
// =====================================================

export const listenForMessages = async (callback) => {
  try {
    const messaging = await initializeMessaging();

    if (!messaging) {
      return null;
    }

    return onMessage(messaging, (payload) => {
      console.log("Foreground FCM message:", payload);

      if (callback) {
        callback(payload);
      }
    });
  } catch (error) {
    console.error("FCM listener error:", error);

    return null;
  }
};
