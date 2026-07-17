const tasks = require("../models/taskModel");

const validStatuses = ["Pending", "In Progress", "Completed"];
const validPriorities = ["High", "Medium", "Low"];
const normalize = (body = {}) => ({
  project_id: Number(body.project_id), assigned_to: Number(body.assigned_to), task_title: body.task_title?.trim(),
  description: body.description?.trim() || "", priority: body.priority || "Medium", status: body.status || "Pending",
  assigned_date: body.assigned_date || null, due_date: body.due_date || null,
});
const validate = (data) => {
  if (!Number.isInteger(data.project_id) || !Number.isInteger(data.assigned_to) || !data.task_title || !data.assigned_date || !data.due_date) return "Project, assignee, title, assigned date, and due date are required.";
  if (!validStatuses.includes(data.status) || !validPriorities.includes(data.priority)) return "Invalid task status or priority.";
  if (data.due_date < data.assigned_date) return "Due date cannot be before the assigned date.";
  return null;
};
const canManage = async (user, projectId) => Number(user.role_id) === 1 || (Number(user.role_id) === 2 && (await require("../models/projectModel").getProjectById(projectId)).rows[0]?.manager_id === Number(user.employee_id));

const getTasks = async (req, res) => {
  try {
    const role = Number(req.user.role_id);
    const result = role === 1 ? await tasks.getAllTasks() : role === 2 ? await tasks.getTasksByManager(req.user.employee_id) : await tasks.getTasksByEmployee(req.user.employee_id);
    res.json({ success: true, tasks: result.rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const addTask = async (req, res) => {
  try {
    if (![1, 2].includes(Number(req.user.role_id))) return res.status(403).json({ success: false, message: "Only admins and managers can assign tasks." });
    const data = normalize(req.body); const error = validate(data); if (error) return res.status(400).json({ success: false, message: error });
    if (!(await canManage(req.user, data.project_id))) return res.status(403).json({ success: false, message: "You can only assign tasks in your projects." });
    const result = await tasks.createTask(data.project_id, data.assigned_to, req.user.employee_id, data.task_title, data.description, data.priority, data.status, data.assigned_date, data.due_date);
    res.status(201).json({ success: true, message: "Task created successfully", task: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const editTask = async (req, res) => {
  try {
    if (![1, 2].includes(Number(req.user.role_id))) return res.status(403).json({ success: false, message: "Access denied." });
    const data = normalize(req.body); const error = validate(data); if (error) return res.status(400).json({ success: false, message: error });
    const current = await tasks.getTaskById(req.params.id); if (!current.rows.length) return res.status(404).json({ success: false, message: "Task not found" });
    if (!(await canManage(req.user, current.rows[0].project_id)) || !(await canManage(req.user, data.project_id))) return res.status(403).json({ success: false, message: "You can only update tasks in your projects." });
    const result = await tasks.updateTask(req.params.id, data.project_id, data.assigned_to, data.task_title, data.description, data.priority, data.status, data.assigned_date, data.due_date);
    res.json({ success: true, task: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const removeTask = async (req, res) => {
  try {
    const current = await tasks.getTaskById(req.params.id); if (!current.rows.length) return res.status(404).json({ success: false, message: "Task not found" });
    if (![1, 2].includes(Number(req.user.role_id)) || !(await canManage(req.user, current.rows[0].project_id))) return res.status(403).json({ success: false, message: "Access denied." });
    await tasks.deleteTask(req.params.id); res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
const changeTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid task status." });
    const current = await tasks.getTaskById(req.params.id); if (!current.rows.length) return res.status(404).json({ success: false, message: "Task not found" });
    const role = Number(req.user.role_id); const allowed = role === 1 || (role === 2 && await canManage(req.user, current.rows[0].project_id)) || (role === 3 && Number(current.rows[0].assigned_to_id) === Number(req.user.employee_id));
    if (!allowed) return res.status(403).json({ success: false, message: "You can only update tasks assigned to you." });
    const result = await tasks.updateTaskStatus(req.params.id, status); res.json({ success: true, task: result.rows[0] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
module.exports = { getTasks, addTask, editTask, removeTask, changeTaskStatus };
