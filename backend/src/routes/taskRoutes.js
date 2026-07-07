const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getTasks,
  addTask,
} = require("../controllers/taskController");

// Protected Routes
router.get("/", verifyToken, getTasks);

router.post("/", verifyToken, addTask);

module.exports = router;