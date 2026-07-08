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
// Create Project
const createProject = async (
  project_name,
  description,
  manager_id,
  department_id,
  start_date,
  end_date,
  status
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
      status
    )
    VALUES($1,$2,$3,$4,$5,$6,$7)
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
  status
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
      status = $7
    WHERE project_id = $8
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
    id,
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
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
};