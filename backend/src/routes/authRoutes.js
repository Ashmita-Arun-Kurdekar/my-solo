const express = require("express");
const router = express.Router();

const {
  testAuth,
  registerEmployee,
  loginEmployee,
} = require("../controllers/authController");

router.get("/test", testAuth);

router.post("/register", registerEmployee);

router.post("/login", loginEmployee);

module.exports = router;