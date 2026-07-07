const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    dashboardStats,
} = require("../controllers/dashboardController");

// Dashboard Welcome (Protected)
router.get("/", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Dashboard",
        user: req.user,
    });
});

// Dashboard Statistics (Protected)
router.get("/stats", verifyToken, dashboardStats);

module.exports = router;