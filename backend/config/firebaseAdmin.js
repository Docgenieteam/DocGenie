const path = require("path");

const { initializeApp, getApps, cert } = require("firebase-admin/app");

// =====================================================
// FIREBASE SERVICE ACCOUNT
// =====================================================

const serviceAccount = require(
  path.join(__dirname, "..", "serviceAccountKey.json"),
);

// =====================================================
// INITIALIZE FIREBASE ADMIN
// =====================================================

let firebaseApp;

if (getApps().length === 0) {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  firebaseApp = getApps()[0];
}

module.exports = firebaseApp;
