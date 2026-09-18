const { getMessaging } = require("firebase-admin/messaging");

require("../config/firebaseAdmin");

const User = require("../models/User");

// =====================================================
// REMOVE INVALID FCM TOKENS
// =====================================================

const removeInvalidTokens = async (user, response) => {
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
  }

  return invalidTokens;
};

// =====================================================
// SEND NOTIFICATION TO ONE USER
// =====================================================

const sendNotificationToUser = async ({ userId, title, body, data = {} }) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("Notification user not found:", userId);
      return {
        success: false,
        reason: "USER_NOT_FOUND",
      };
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      console.log("No FCM tokens for user:", user.email);

      return {
        success: false,
        reason: "NO_FCM_TOKENS",
      };
    }

    const message = {
      notification: {
        title,
        body,
      },

      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)]),
      ),

      tokens: user.fcmTokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);

    await removeInvalidTokens(user, response);

    console.log(
      `Notification sent to ${user.email}: ${response.successCount} successful, ${response.failureCount} failed`,
    );

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error("FCM notification error:", error);

    return {
      success: false,
      reason: "FCM_ERROR",
      error: error.message,
    };
  }
};

// =====================================================
// SEND DOCUMENT EXPIRY NOTIFICATION
// =====================================================

const sendDocumentExpiryNotification = async ({
  userId,
  documentId,
  documentName,
  expiryDate,
  daysRemaining,
}) => {
  let title;
  let body;

  if (daysRemaining === 30) {
    title = "Document Expiring Soon";
    body = `${documentName} will expire in 30 days.`;
  } else if (daysRemaining === 7) {
    title = "Document Expiring Soon";
    body = `${documentName} will expire in 7 days.`;
  } else if (daysRemaining === 1) {
    title = "Document Expires Tomorrow";
    body = `${documentName} will expire tomorrow.`;
  } else if (daysRemaining === 0) {
    title = "Document Expires Today";
    body = `${documentName} expires today.`;
  } else if (daysRemaining < 0) {
    title = "Document Expired";
    body = `${documentName} has expired.`;
  } else {
    title = "Document Reminder";
    body = `${documentName} expires in ${daysRemaining} days.`;
  }

  return sendNotificationToUser({
    userId,

    title,

    body,

    data: {
      type: "document_expiry",
      documentId: documentId.toString(),
      documentName,
      expiryDate: new Date(expiryDate).toISOString(),
      daysRemaining,
    },
  });
};

module.exports = {
  sendNotificationToUser,
  sendDocumentExpiryNotification,
};
