const pool = require("../config/db");

// Create Employee
const createEmployee = async (
  full_name,
  email,
  password,
  phone,
  designation,
  role_id,
  department_id
) => {
  const query = `
    INSERT INTO employees
    (full_name, email, password, phone, designation, role_id, department_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;

  const values = [
    full_name,
    email,
    password,
    phone,
    designation,
    role_id,
    department_id,
  ];

  return await pool.query(query, values);
};

// Find Employee By Email
const findEmployeeByEmail = async (email) => {
  const query = `
    SELECT * FROM employees
    WHERE email = $1;
  `;

  return await pool.query(query, [email]);
};

// Get All Employees
const getAllEmployees = async () => {
  const query = `
    SELECT
      employee_id,
      full_name,
      email,
      phone,
      designation,
      e.role_id,
      e.department_id,
      CASE e.role_id WHEN 1 THEN 'Admin' WHEN 2 THEN 'Manager' ELSE 'Employee' END AS role_name,
      d.department_name
    FROM employees e
    LEFT JOIN departments d ON d.department_id = e.department_id
    ORDER BY e.employee_id;
  `;

  return await pool.query(query);
};

// Get Managers Only
const getManagers = async () => {
  const query = `
    SELECT
      employee_id,
      full_name
    FROM employees
    WHERE role_id = 2
    ORDER BY full_name;
  `;

  return await pool.query(query);
};
// Delete Employee
const deleteEmployee = async (id) => {
  const query = `
    DELETE FROM employees
    WHERE employee_id = $1
    RETURNING *;
  `;

  return await pool.query(query, [id]);
};
// Update Employee
const updateEmployee = async (
  id,
  full_name,
  phone,
  designation,
  department_id
) => {

  const query = `
    UPDATE employees
    SET
      full_name = $1,
      phone = $2,
      designation = $3,
      department_id = $4
    WHERE employee_id = $5
    RETURNING *;
  `;

  const values = [
    full_name,
    phone,
    designation,
    department_id,
    id,
  ];

  return await pool.query(query, values);
};
module.exports = {
  createEmployee,
  findEmployeeByEmail,
  getAllEmployees,
  getManagers,
  deleteEmployee,
  updateEmployee,
};
