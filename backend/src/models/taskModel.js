const pool = require("../config/db");

const taskSelect = `SELECT t.task_id, t.project_id, t.assigned_to AS assigned_to_id, t.assigned_by AS assigned_by_id,
  t.task_title, t.description, p.project_name, e1.full_name AS assigned_to, e2.full_name AS assigned_by,
  t.priority, t.status, t.assigned_date, t.due_date, t.completed_date
  FROM tasks t JOIN projects p ON t.project_id = p.project_id
  LEFT JOIN employees e1 ON t.assigned_to = e1.employee_id
  LEFT JOIN employees e2 ON t.assigned_by = e2.employee_id`;

const getAllTasks = () => pool.query(`${taskSelect} ORDER BY t.task_id`);
const getTasksByEmployee = (employeeId) => pool.query(`${taskSelect} WHERE t.assigned_to = $1 ORDER BY t.task_id`, [employeeId]);
const getTasksByManager = (managerId) => pool.query(`${taskSelect} WHERE p.manager_id = $1 ORDER BY t.task_id`, [managerId]);
const getTaskById = (id) => pool.query(`${taskSelect} WHERE t.task_id = $1`, [id]);

const createTask = (project_id, assigned_to, assigned_by, task_title, description, priority, status, assigned_date, due_date) =>
  pool.query(`INSERT INTO tasks (project_id, assigned_to, assigned_by, task_title, title, employee_id, description, priority, status, assigned_date, due_date)
    VALUES ($1,$2,$3,$4::text,CAST($4::text AS varchar),$2,$5,$6,$7,$8,$9) RETURNING *`, [project_id, assigned_to, assigned_by, task_title, description, priority, status, assigned_date, due_date]);

const updateTask = (id, project_id, assigned_to, task_title, description, priority, status, assigned_date, due_date) =>
  pool.query(`UPDATE tasks SET project_id=$1, assigned_to=$2, employee_id=$2, task_title=$3::text, title=CAST($3::text AS varchar), description=$4, priority=$5, status=$6,
    assigned_date=$7, due_date=$8, completed_date=CASE WHEN $6 = 'Completed' THEN COALESCE(completed_date, CURRENT_DATE) ELSE NULL END
    WHERE task_id=$9 RETURNING *`, [project_id, assigned_to, task_title, description, priority, status, assigned_date, due_date, id]);

const updateTaskStatus = (id, status) => pool.query(`UPDATE tasks SET status=$1,
  completed_date=CASE WHEN $2 = 'Completed' THEN COALESCE(completed_date, CURRENT_DATE) ELSE NULL END WHERE task_id=$3 RETURNING *`, [status, status, id]);
const deleteTask = (id) => pool.query("DELETE FROM tasks WHERE task_id = $1 RETURNING *", [id]);

module.exports = { getAllTasks, getTasksByEmployee, getTasksByManager, getTaskById, createTask, updateTask, updateTaskStatus, deleteTask };
