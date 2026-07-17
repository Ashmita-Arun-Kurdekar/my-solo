const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getTasks,
  addTask,
  editTask,
  removeTask,
  changeTaskStatus,
} = require("../controllers/taskController");

// Protected Routes
router.get("/", verifyToken, getTasks);

router.post("/", verifyToken, addTask);
router.put("/:id", verifyToken, editTask);
router.patch("/:id/status", verifyToken, changeTaskStatus);
router.delete("/:id", verifyToken, removeTask);

module.exports = router;
