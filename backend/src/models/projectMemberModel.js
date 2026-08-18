const pool = require("../config/db");

const getProjectMembers = (projectId) => pool.query(
  `SELECT pm.id, pm.project_id, pm.employee_id, pm.assigned_by, pm.role_in_project, pm.created_at,
          e.full_name, e.email, e.phone, e.designation, e.department_id,
          d.department_name,
          assigned_by_employee.full_name AS assigned_by_name
   FROM project_members pm
   JOIN employees e ON e.employee_id = pm.employee_id
   LEFT JOIN employees assigned_by_employee ON assigned_by_employee.employee_id = pm.assigned_by
   LEFT JOIN departments d ON d.department_id = e.department_id
   WHERE pm.project_id = $1
   ORDER BY pm.role_in_project DESC, e.full_name`,
  [projectId]
);

const addProjectMember = (projectId, employeeId, assignedBy, roleInProject = "member") => pool.query(
  `INSERT INTO project_members (project_id, employee_id, assigned_by, role_in_project)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (project_id, employee_id) DO NOTHING
   RETURNING *`,
  [projectId, employeeId, assignedBy, roleInProject]
);

const removeProjectMember = (projectId, employeeId) => pool.query(
  `DELETE FROM project_members
   WHERE project_id = $1 AND employee_id = $2
   RETURNING *`,
  [projectId, employeeId]
);

const isProjectMember = (projectId, employeeId) => pool.query(
  `SELECT 1
   FROM project_members
   WHERE project_id = $1 AND employee_id = $2
   LIMIT 1`,
  [projectId, employeeId]
);

module.exports = {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  isProjectMember,
};