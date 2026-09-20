const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  saveFCMToken,
  removeFCMToken,
  sendTestNotification,
} = require("../controllers/notificationController");
const { processDocumentExpiryNotifications } = require("../jobs/expiryChecker");

const router = express.Router();

// =====================================================
// SAVE FCM TOKEN
// =====================================================

router.post("/fcm-token", protect, saveFCMToken);

// =====================================================
// REMOVE FCM TOKEN
// =====================================================

router.delete("/fcm-token", protect, removeFCMToken);

// =====================================================
// TEST PUSH NOTIFICATION
// =====================================================

router.post("/test", protect, sendTestNotification);
router.post("/test-expiry", protect, async (req, res) => {
  try {
    await processDocumentExpiryNotifications();

    return res.status(200).json({
      success: true,
      message: "Expiry notification check completed.",
    });
  } catch (error) {
    console.error("Test expiry notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Expiry notification check failed.",
    });
  }
});

module.exports = router;
