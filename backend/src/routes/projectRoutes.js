const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getProjectByIdController,
} = require("../controllers/projectController");

// Protected Routes
router.get("/", verifyToken, getProjects);

router.get("/:id", verifyToken, getProjectByIdController);

router.post("/", verifyToken, addProject);

router.put("/:id", verifyToken, editProject);

router.delete("/:id", verifyToken, removeProject);

module.exports = router;