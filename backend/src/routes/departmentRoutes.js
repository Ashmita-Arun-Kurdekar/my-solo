const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getDepartments,
} = require("../controllers/departmentController");

// Protected Route
router.get("/", verifyToken, authorizeRoles(1, 2), getDepartments);

module.exports = router;
