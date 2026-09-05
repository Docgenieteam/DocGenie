const { getMessaging } = require("firebase-admin/messaging");

require("../config/firebaseAdmin");

const User = require("../models/User");

// =====================================================
// SAVE FCM TOKEN
// =====================================================

const saveFCMToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required.",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          fcmTokens: token,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "FCM token saved successfully.",
    });
  } catch (error) {
    console.error("Save FCM token error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save FCM token.",
    });
  }
};

// =====================================================
// REMOVE FCM TOKEN
// =====================================================

const removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required.",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        fcmTokens: token,
      },
    });

    return res.status(200).json({
      success: true,
      message: "FCM token removed successfully.",
    });
  } catch (error) {
    console.error("Remove FCM token error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove FCM token.",
    });
  }
};

// =====================================================
// TEST PUSH NOTIFICATION
// =====================================================

const sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No FCM token registered for this user.",
      });
    }

    const message = {
      notification: {
        title: "DocGenie Test Notification",
        body: "Push notifications are working successfully!",
      },

      data: {
        type: "test",
        app: "DocGenie",
      },

      tokens: user.fcmTokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);

    // ---------------------------------------------------
    // REMOVE INVALID TOKENS
    // ---------------------------------------------------

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

    return res.status(200).json({
      success: true,
      message: "Test notification sent.",
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("Send test notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send test notification.",
    });
  }
};

module.exports = {
  saveFCMToken,
  removeFCMToken,
  sendTestNotification,
};
