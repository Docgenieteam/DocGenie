const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");

const admin = require("firebase-admin");
const mongoose = require("mongoose");

// =====================================================
// FIREBASE ADMIN
// =====================================================

if (!admin.apps.length) {
  admin.initializeApp();
}

const { getMessaging } = require("firebase-admin/messaging");

// =====================================================
// MONGODB SECRET
// =====================================================

const MONGODB_URI = defineSecret("MONGODB_URI");

// =====================================================
// DOCUMENT MODEL
// =====================================================

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    expiry: {
      type: String,
      default: "",
    },

    expiryNotificationsSent: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "documents",
  },
);

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

// =====================================================
// USER MODEL
// =====================================================

const userSchema = new mongoose.Schema(
  {
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "users",
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// =====================================================
// MONGODB CONNECTION
// =====================================================

let mongoConnection = null;

async function connectMongoDB() {
  if (mongoConnection) {
    return mongoConnection;
  }

  const mongoUri = MONGODB_URI.value();

  if (!mongoUri) {
    throw new Error("MONGODB_URI secret is missing.");
  }

  mongoConnection = await mongoose.connect(mongoUri);

  console.log("MongoDB connected successfully.");

  return mongoConnection;
}

// =====================================================
// PARSE YYYY-MM-DD
// =====================================================

function parseExpiryDate(expiry) {
  if (!expiry || typeof expiry !== "string") {
    return null;
  }

  const parts = expiry.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// =====================================================
// TODAY
// =====================================================

function getToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

// =====================================================
// DAYS REMAINING
// =====================================================

function getDaysRemaining(expiryDate) {
  const today = getToday();

  const difference = expiryDate.getTime() - today.getTime();

  return Math.round(difference / (1000 * 60 * 60 * 24));
}

// =====================================================
// NOTIFICATION TYPE
// =====================================================

function getNotificationType(daysRemaining) {
  if (daysRemaining === 90) {
    return "90";
  }

  if (daysRemaining === 30) {
    return "30";
  }

  if (daysRemaining === 7) {
    return "7";
  }

  if (daysRemaining === 1) {
    return "1";
  }

  if (daysRemaining === 0) {
    return "0";
  }

  if (daysRemaining < 0) {
    return "expired";
  }

  return null;
}

// =====================================================
// NOTIFICATION CONTENT
// =====================================================

function getNotificationMessage(document, daysRemaining) {
  if (daysRemaining === 90) {
    return {
      title: "DocGenie Expiry Reminder",
      body: `${document.name} expires in 90 days.`,
    };
  }

  if (daysRemaining === 30) {
    return {
      title: "DocGenie Expiry Reminder",
      body: `${document.name} expires in 30 days.`,
    };
  }

  if (daysRemaining === 7) {
    return {
      title: "DocGenie Expiry Alert",
      body: `${document.name} expires in 7 days.`,
    };
  }

  if (daysRemaining === 1) {
    return {
      title: "DocGenie Expiry Alert",
      body: `${document.name} expires tomorrow.`,
    };
  }

  if (daysRemaining === 0) {
    return {
      title: "DocGenie Expiry Alert",
      body: `${document.name} expires today.`,
    };
  }

  return {
    title: "DocGenie Document Expired",
    body: `${document.name} has expired.`,
  };
}

// =====================================================
// SEND NOTIFICATION
// =====================================================

async function sendExpiryNotification(
  document,
  user,
  notificationType,
  daysRemaining,
) {
  if (!user) {
    console.log(`User not found for document ${document._id}`);

    return;
  }

  if (!user.fcmTokens || user.fcmTokens.length === 0) {
    console.log(`No FCM tokens for user ${user._id}`);

    return;
  }

  const notification = getNotificationMessage(document, daysRemaining);

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },

    data: {
      type: "expiry",
      documentId: String(document._id),
      notificationType,
      daysRemaining: String(daysRemaining),
      app: "DocGenie",
    },

    tokens: user.fcmTokens,
  };

  console.log(
    `Sending "${notificationType}" notification for ${document.name}`,
  );

  const response = await getMessaging().sendEachForMulticast(message);

  console.log(
    `Notification result: ${response.successCount} success, ${response.failureCount} failed`,
  );

  // ===================================================
  // REMOVE INVALID TOKENS
  // ===================================================

  const invalidTokens = [];

  response.responses.forEach((result, index) => {
    if (!result.success) {
      const errorCode = result.error?.code;

      if (
        errorCode === "messaging/invalid-registration-token" ||
        errorCode === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(user.fcmTokens[index]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await User.findByIdAndUpdate(user._id, {
      $pull: {
        fcmTokens: {
          $in: invalidTokens,
        },
      },
    });

    console.log(`Removed ${invalidTokens.length} invalid FCM tokens.`);
  }
}

// =====================================================
// AUTOMATIC EXPIRY NOTIFICATION JOB
// =====================================================
//
// Runs every day at 9:00 AM India time.
//
// =====================================================

exports.sendAutomaticExpiryNotifications = onSchedule(
  {
    schedule: "0 9 * * *",

    timeZone: "Asia/Kolkata",

    region: "asia-south1",

    secrets: [MONGODB_URI],

    memory: "256MiB",

    timeoutSeconds: 120,
  },

  async () => {
    console.log("========================================");

    console.log("DocGenie expiry notification job started.");

    console.log("========================================");

    try {
      // ---------------------------------------------
      // CONNECT TO MONGODB
      // ---------------------------------------------

      await connectMongoDB();

      // ---------------------------------------------
      // GET DOCUMENTS WITH EXPIRY DATES
      // ---------------------------------------------

      const documents = await Document.find({
        expiry: {
          $exists: true,
          $ne: "",
        },
      });

      console.log(`Found ${documents.length} documents with expiry dates.`);

      // ---------------------------------------------
      // PROCESS DOCUMENTS
      // ---------------------------------------------

      for (const document of documents) {
        try {
          const expiryDate = parseExpiryDate(document.expiry);

          if (!expiryDate) {
            console.log(
              `Invalid expiry date for ${document.name}: ${document.expiry}`,
            );

            continue;
          }

          const daysRemaining = getDaysRemaining(expiryDate);

          console.log(`${document.name}: ${daysRemaining} days remaining`);

          // -----------------------------------------
          // DETERMINE NOTIFICATION TYPE
          // -----------------------------------------

          const notificationType = getNotificationType(daysRemaining);

          // Nothing to send today.
          if (!notificationType) {
            continue;
          }

          // -----------------------------------------
          // PREVENT DUPLICATES
          // -----------------------------------------

          if (document.expiryNotificationsSent?.includes(notificationType)) {
            console.log(
              `Skipping ${document.name}: ${notificationType} notification already sent.`,
            );

            continue;
          }

          // -----------------------------------------
          // FIND USER
          // -----------------------------------------

          const user = await User.findById(document.userId);

          if (!user) {
            console.log(`User not found for ${document.name}`);

            continue;
          }

          // -----------------------------------------
          // SEND FCM
          // -----------------------------------------

          await sendExpiryNotification(
            document,
            user,
            notificationType,
            daysRemaining,
          );

          // -----------------------------------------
          // MARK AS SENT
          // -----------------------------------------

          await Document.findByIdAndUpdate(document._id, {
            $addToSet: {
              expiryNotificationsSent: notificationType,
            },
          });

          console.log(
            `${notificationType} notification marked as sent for ${document.name}.`,
          );
        } catch (documentError) {
          console.error(
            `Error processing document ${document._id}:`,
            documentError,
          );
        }
      }

      console.log("========================================");

      console.log("DocGenie expiry notification job finished.");

      console.log("========================================");
    } catch (error) {
      console.error("Automatic expiry notification job failed:", error);

      throw error;
    }
  },
);
