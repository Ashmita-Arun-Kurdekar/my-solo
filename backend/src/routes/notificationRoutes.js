const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const { getMyNotifications, markNotificationRead } = require("../controllers/notificationController");

router.get("/", verifyToken, getMyNotifications);
router.patch("/:id/read", verifyToken, markNotificationRead);

module.exports = router;