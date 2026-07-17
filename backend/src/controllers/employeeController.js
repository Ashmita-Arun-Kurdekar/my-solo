const bcrypt = require("bcrypt");
const {
  getAllEmployees, getManagers, deleteEmployee, updateEmployee, createEmployee, findEmployeeByEmail,
} = require("../models/employeeModel");

const getEmployees = async (req, res) => {
  try { res.json({ success: true, employees: (await getAllEmployees()).rows }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addEmployee = async (req, res) => {
  try {
    const { full_name, email, password, phone = "", designation, role_id, department_id } = req.body;
    if (!full_name?.trim() || !email?.trim() || !password || !designation?.trim() || !role_id || !department_id) return res.status(400).json({ success: false, message: "All required employee fields must be completed." });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if ((await findEmployeeByEmail(normalizedEmail)).rows.length) return res.status(409).json({ success: false, message: "Email already exists." });
    const employee = await createEmployee(full_name.trim(), normalizedEmail, await bcrypt.hash(password, 10), phone.trim(), designation.trim(), Number(role_id), Number(department_id));
    res.status(201).json({ success: true, message: "Employee created successfully", employee: employee.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getManagersList = async (req, res) => {
  try { res.json({ success: true, managers: (await getManagers()).rows }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const removeEmployee = async (req, res) => {
  try {
    const result = await deleteEmployee(req.params.id);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const editEmployee = async (req, res) => {
  try {
    const { full_name, phone = "", designation, department_id } = req.body;
    if (!full_name?.trim() || !designation?.trim() || !department_id) return res.status(400).json({ success: false, message: "Name, designation, and department are required." });
    const result = await updateEmployee(req.params.id, full_name.trim(), phone.trim(), designation.trim(), Number(department_id));
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, employee: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { getEmployees, addEmployee, getManagersList, removeEmployee, editEmployee };
