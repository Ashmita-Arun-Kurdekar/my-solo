const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  createEmployee,
  findEmployeeByEmail,
} = require("../models/employeeModel");

// Test Route
const testAuth = async (req, res) => {
  res.json({
    success: true,
    message: "Auth Controller Working!",
  });
};

// Register
const registerEmployee = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      designation,
      role_id,
      department_id,
    } = req.body;

    const existing = await findEmployeeByEmail(email);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createEmployee(
      full_name,
      email,
      hashedPassword,
      phone,
      designation,
      role_id,
      department_id
    );

    res.status(201).json({
      success: true,
      message: "Employee Registered Successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await findEmployeeByEmail(email);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const employee = result.rows[0];

    const match = await bcrypt.compare(password, employee.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        role_id: employee.role_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      token,
      employee: {
        id: employee.employee_id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role_id,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testAuth,
  registerEmployee,
  loginEmployee,
};