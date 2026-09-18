const cron = require("node-cron");

const Document = require("../models/Document");

const { sendDocumentExpiryNotification } = require("../services/fcmServices");

// =====================================================
// NOTIFICATION DAYS
// =====================================================
//
// Notification will be sent:
// - 30 days before expiry
// - 7 days before expiry
// - 1 day before expiry
// - On expiry day
// - After expiry
//
// You can change these later.
// =====================================================

const NOTIFICATION_DAYS = [30, 7, 1, 0];

// =====================================================
// GET START OF DAY
// =====================================================

const startOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

// =====================================================
// CALCULATE DAYS REMAINING
// =====================================================

const getDaysRemaining = (expiryDate) => {
  const today = startOfDay(new Date());

  const expiry = startOfDay(new Date(expiryDate));

  const difference = expiry.getTime() - today.getTime();

  return Math.round(difference / (1000 * 60 * 60 * 24));
};

// =====================================================
// PROCESS DOCUMENT EXPIRY NOTIFICATIONS
// =====================================================

const processDocumentExpiryNotifications = async () => {
  try {
    console.log("Checking documents for expiry notifications...");

    const documents = await Document.find({
      expiry: {
        $exists: true,
        $ne: "",
      },
    });

    console.log(`Found ${documents.length} documents to check.`);

    for (const document of documents) {
      try {
        if (!document.expiry) {
          continue;
        }

        const expiryDate = new Date(document.expiry);

        if (Number.isNaN(expiryDate.getTime())) {
          console.log(`Invalid expiry date for document ${document._id}`);

          continue;
        }

        const daysRemaining = getDaysRemaining(expiryDate);

        // ---------------------------------------------
        // Only send on configured days
        // ---------------------------------------------

        if (!NOTIFICATION_DAYS.includes(daysRemaining)) {
          continue;
        }

        // ---------------------------------------------
        // Check whether this notification was already sent
        // ---------------------------------------------

        const notificationKey = `${daysRemaining}`;

        const alreadySent = document.expiryNotificationsSent?.some(
          (item) => item === notificationKey,
        );

        if (alreadySent) {
          continue;
        }

        // ---------------------------------------------
        // SEND NOTIFICATION
        // ---------------------------------------------

        const result = await sendDocumentExpiryNotification({
          userId: document.userId,
          documentId: document._id,
          documentName: document.name,
          expiryDate,
          daysRemaining,
        });

        // ---------------------------------------------
        // Only mark as sent when FCM succeeded
        // ---------------------------------------------

        if (result.success) {
          await Document.findByIdAndUpdate(document._id, {
            $addToSet: {
              expiryNotificationsSent: notificationKey,
            },
          });

          console.log(
            `Expiry notification sent for "${document.name}" (${daysRemaining} days remaining).`,
          );
        } else {
          console.log(
            `Notification not sent for "${document.name}". Reason: ${result.reason}`,
          );
        }
      } catch (documentError) {
        console.error(
          `Error processing document ${document._id}:`,
          documentError,
        );
      }
    }

    console.log("Document expiry notification check completed.");
  } catch (error) {
    console.error("Document expiry notification job error:", error);
  }
};

// =====================================================
// START AUTOMATIC JOB
// =====================================================

const startNotificationJob = () => {
  console.log("Document notification scheduler started.");

  // ---------------------------------------------------
  // RUN EVERY DAY AT 9:00 AM
  // ---------------------------------------------------

  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("Running scheduled document expiry check...");

      await processDocumentExpiryNotifications();
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  // ---------------------------------------------------
  // RUN ON SERVER START
  // ---------------------------------------------------
  //
  // This is useful for testing.
  // It also means you don't have to wait until 9 AM
  // after restarting your backend.
  // ---------------------------------------------------

  processDocumentExpiryNotifications();
};

module.exports = {
  startNotificationJob,
  processDocumentExpiryNotifications,
};
