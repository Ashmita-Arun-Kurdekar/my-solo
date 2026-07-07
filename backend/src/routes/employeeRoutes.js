const express = require("express");

const router = express.Router();

const {
  getEmployees,
  getManagersList,
  removeEmployee,
  editEmployee,
} = require("../controllers/employeeController");
router.get("/", getEmployees);
router.get("/managers", getManagersList);
router.delete("/:id", removeEmployee);
router.put("/:id", editEmployee);
module.exports = router;