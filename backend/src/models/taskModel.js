const pool = require("../config/db");

// Get All Tasks
const getAllTasks = async () => {

  const query = `
    SELECT
      t.task_id,
      t.task_title,
      t.description,
      p.project_name,
      e1.full_name AS assigned_to,
      e2.full_name AS assigned_by,
      t.priority,
      t.status,
      t.assigned_date,
      t.due_date,
      t.completed_date
    FROM tasks t
    JOIN projects p
      ON t.project_id = p.project_id
    JOIN employees e1
      ON t.assigned_to = e1.employee_id
    JOIN employees e2
      ON t.assigned_by = e2.employee_id
    ORDER BY t.task_id;
  `;

  return await pool.query(query);
};

// Create Task
const createTask = async (
  project_id,
  assigned_to,
  assigned_by,
  task_title,
  description,
  priority,
  status,
  assigned_date,
  due_date
) => {

  const query = `
    INSERT INTO tasks
    (
      project_id,
      assigned_to,
      assigned_by,
      task_title,
      description,
      priority,
      status,
      assigned_date,
      due_date
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;

  return await pool.query(query, [
    project_id,
    assigned_to,
    assigned_by,
    task_title,
    description,
    priority,
    status,
    assigned_date,
    due_date,
  ]);
};

module.exports = {
  getAllTasks,
  createTask,
};