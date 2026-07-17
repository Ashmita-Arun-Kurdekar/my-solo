const express = require("express");

const router = express.Router();

const {
  getEmployees,
  addEmployee,
  getManagersList,
  removeEmployee,
  editEmployee,
} = require("../controllers/employeeController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.get("/", verifyToken, authorizeRoles(1, 2), getEmployees);
router.get("/managers", verifyToken, authorizeRoles(1, 2), getManagersList);
router.post("/", verifyToken, authorizeRoles(1), addEmployee);
router.delete("/:id", verifyToken, authorizeRoles(1), removeEmployee);
router.put("/:id", verifyToken, authorizeRoles(1), editEmployee);
module.exports = router;
