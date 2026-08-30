const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  saveFCMToken,
  removeFCMToken,
  sendTestNotification,
} = require("../controllers/notificationController");

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

module.exports = router;
