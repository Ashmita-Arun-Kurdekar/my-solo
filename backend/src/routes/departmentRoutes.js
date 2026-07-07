const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getDepartments,
} = require("../controllers/departmentController");

// Protected Route
router.get("/", verifyToken, getDepartments);

module.exports = router;