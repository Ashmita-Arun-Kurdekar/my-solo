const pool = require("../config/db");

const getTaskUpdates = (taskId) => pool.query(
  `SELECT tu.update_id, tu.task_id, tu.employee_id, tu.update_text, tu.status, tu.created_at,
          e.full_name
   FROM task_updates tu
   JOIN employees e ON e.employee_id = tu.employee_id
   WHERE tu.task_id = $1
   ORDER BY tu.created_at DESC`,
  [taskId]
);

const addTaskUpdate = (taskId, employeeId, updateText, status = null) => pool.query(
  `INSERT INTO task_updates (task_id, employee_id, update_text, status)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
  [taskId, employeeId, updateText, status]
);

module.exports = {
  getTaskUpdates,
  addTaskUpdate,
};