const { initializeApp, getApps, cert } = require("firebase-admin/app");

if (getApps().length === 0) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT environment variable is missing.",
    );
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    );
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = getApps()[0];
