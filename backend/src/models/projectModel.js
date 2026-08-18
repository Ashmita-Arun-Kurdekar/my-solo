const pool = require("../config/db");

// Get All Projects
const getAllProjects = async () => {

  const query = `
    SELECT
      p.project_id,
      p.project_name,
      p.description,
      p.manager_id,
      p.department_id,
      e.full_name AS manager,
      d.department_name,
      p.start_date,
      p.end_date,
      p.status
      , p.required_skills, p.required_roles, p.priority, p.maximum_team_size,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) AS member_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'Completed') AS completed_task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status <> 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_task_count
    FROM projects p
    LEFT JOIN employees e
      ON p.manager_id = e.employee_id
    LEFT JOIN departments d
      ON p.department_id = d.department_id
    ORDER BY p.project_id;
  `;

  return await pool.query(query);
};
// Get Projects By Manager
const getProjectsByManager = async (managerId) => {
  const query = `
    SELECT
      p.project_id,
      p.project_name,
      p.description,
      p.manager_id,
      p.department_id,
      e.full_name AS manager,
      d.department_name,
      p.start_date,
      p.end_date,
      p.status
      , p.required_skills, p.required_roles, p.priority, p.maximum_team_size,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) AS member_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'Completed') AS completed_task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status <> 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_task_count
    FROM projects p
    LEFT JOIN employees e
      ON p.manager_id = e.employee_id
    LEFT JOIN departments d
      ON p.department_id = d.department_id
    WHERE p.manager_id = $1
    ORDER BY p.project_id;
  `;

  return await pool.query(query, [managerId]);
};
const getProjectsByEmployee = async (employeeId) => {
  const query = `
    SELECT DISTINCT p.project_id, p.project_name, p.description, p.manager_id, p.department_id,
      e.full_name AS manager, d.department_name, p.start_date, p.end_date, p.status, p.required_skills, p.required_roles, p.priority, p.maximum_team_size,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) AS member_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'Completed') AS completed_task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status <> 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_task_count
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.project_id
    LEFT JOIN tasks t ON t.project_id = p.project_id
    LEFT JOIN employees e ON p.manager_id = e.employee_id
    LEFT JOIN departments d ON p.department_id = d.department_id
    WHERE p.manager_id = $1 OR pm.employee_id = $1 OR t.assigned_to = $1
    ORDER BY p.project_id;`;
  return pool.query(query, [employeeId]);
};
// Create Project
const createProject = async (
  project_name,
  description,
  manager_id,
  department_id,
  start_date,
  end_date,
  status, required_skills, required_roles, priority, maximum_team_size
) => {

  const query = `
    INSERT INTO projects
    (
      project_name,
      description,
      manager_id,
      department_id,
      start_date,
      end_date,
      status, required_skills, required_roles, priority, maximum_team_size
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  return await pool.query(query, [
    project_name,
    description,
    manager_id,
    department_id,
    start_date,
    end_date,
    status,
    required_skills || [], required_roles || [], priority || "Medium", maximum_team_size || 5
  ]);
};
// Update Project
const updateProject = async (
  id,
  project_name,
  description,
  manager_id,
  department_id,
  start_date,
  end_date,
  status, required_skills, required_roles, priority, maximum_team_size
) => {
  const query = `
    UPDATE projects
    SET
      project_name = $1,
      description = $2,
      manager_id = $3,
      department_id = $4,
      start_date = $5,
      end_date = $6,
      status = $7, required_skills = $8, required_roles = $9, priority = $10, maximum_team_size = $11
    WHERE project_id = $12
    RETURNING *;
  `;

  return await pool.query(query, [
    project_name,
    description,
    manager_id,
    department_id,
    start_date,
    end_date,
    status,
    required_skills || [], required_roles || [], priority || "Medium", maximum_team_size || 5, id,
  ]);
};

// Delete Project
const deleteProject = async (id) => {
  const query = `
    DELETE FROM projects
    WHERE project_id = $1
    RETURNING *;
  `;

  return await pool.query(query, [id]);
};
// Get Project By ID
const getProjectById = async (id) => {
  const query = `
    SELECT
      p.project_id,
      p.project_name,
      p.description,
      p.manager_id,
      p.department_id,
      e.full_name AS manager,
      d.department_name,
      p.start_date,
      p.end_date,
      p.status
      , p.required_skills, p.required_roles, p.priority, p.maximum_team_size
    FROM projects p
    LEFT JOIN employees e
      ON p.manager_id = e.employee_id
    LEFT JOIN departments d
      ON p.department_id = d.department_id
    WHERE p.project_id = $1
    LIMIT 1;
  `;

  return await pool.query(query, [id]);
};
module.exports = {
  getAllProjects,
  getProjectsByManager,
  getProjectsByEmployee,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
};
