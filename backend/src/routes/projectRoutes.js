const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getProjectByIdController,
  getProjectMembersController,
  addProjectMemberController,
  removeProjectMemberController,
  getProjectAvailableEmployeesController,
  getProjectSuggestedEmployeeController,
} = require("../controllers/projectController");

// Protected Routes
router.get("/", verifyToken, getProjects);

router.get("/:id", verifyToken, getProjectByIdController);
router.get("/:id/members", verifyToken, getProjectMembersController);
router.get("/:id/available-employees", verifyToken, getProjectAvailableEmployeesController);
router.get("/:id/suggested-employee", verifyToken, getProjectSuggestedEmployeeController);

router.post("/", verifyToken, addProject);
router.post("/:id/members", verifyToken, addProjectMemberController);

router.put("/:id", verifyToken, editProject);

router.delete("/:id", verifyToken, removeProject);
router.delete("/:id/members/:employeeId", verifyToken, removeProjectMemberController);

module.exports = router;