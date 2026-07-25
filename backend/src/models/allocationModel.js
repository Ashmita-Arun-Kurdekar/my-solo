const pool = require("../config/db");

const getEmployeeProfiles = () => pool.query(`
  SELECT e.employee_id, e.full_name, e.email, e.department_id,
    COALESCE(p.skills, ARRAY[]::text[]) AS skills, COALESCE(p.certifications, ARRAY[]::text[]) AS certifications,
    COALESCE(p.previous_projects, ARRAY[]::text[]) AS previous_projects, p.experience_years,
    p.preferred_domain, COALESCE(p.current_workload, 0) AS current_workload,
    COALESCE(p.availability_status, 'Available') AS availability_status
  FROM employees e LEFT JOIN employee_profiles p ON p.employee_id = e.employee_id
  WHERE e.role_id = 3 ORDER BY e.full_name`);

const getEmployeeProfile = (id) => pool.query(`
  SELECT e.employee_id, e.full_name, e.email, e.department_id,
    COALESCE(p.skills, ARRAY[]::text[]) AS skills, COALESCE(p.certifications, ARRAY[]::text[]) AS certifications,
    COALESCE(p.previous_projects, ARRAY[]::text[]) AS previous_projects, p.experience_years,
    p.preferred_domain, COALESCE(p.current_workload, 0) AS current_workload,
    COALESCE(p.availability_status, 'Available') AS availability_status
  FROM employees e LEFT JOIN employee_profiles p ON p.employee_id = e.employee_id
  WHERE e.employee_id = $1 AND e.role_id = 3`, [id]);

const getProjectRequirements = (id) => pool.query(`
  SELECT p.project_id, p.project_name, p.maximum_team_size, p.required_skills, p.required_roles
  FROM projects p WHERE p.project_id = $1`, [id]);

const savePrediction = ({ employeeId, predictedRole, confidence, matchingSkills, reason }) => pool.query(`
  INSERT INTO prediction_history (employee_id, predicted_role, confidence_score, matching_skills, reason)
  VALUES ($1,$2,$3,$4,$5) RETURNING *`, [employeeId, predictedRole, confidence, matchingSkills, reason]);

const replaceAllocations = async (projectId, allocations) => {
  await pool.query("DELETE FROM allocations WHERE project_id = $1 AND allocation_source = 'auto'", [projectId]);
  return Promise.all(allocations.map((allocation) => pool.query(`
    INSERT INTO allocations (project_id, employee_id, predicted_role, allocation_score, explanation, allocation_source)
    VALUES ($1,$2,$3,$4,$5,'auto') RETURNING *`, [projectId, allocation.employeeId, allocation.predictedRole, allocation.score, allocation.explanation])));
};

const getAllocations = (projectId) => pool.query(`
  SELECT a.*, p.project_name, e.full_name, e.email FROM allocations a
  JOIN projects p ON p.project_id = a.project_id JOIN employees e ON e.employee_id = a.employee_id
  WHERE ($1::integer IS NULL OR a.project_id = $1) ORDER BY a.created_at DESC`, [projectId || null]);

module.exports = { getEmployeeProfiles, getEmployeeProfile, getProjectRequirements, savePrediction, replaceAllocations, getAllocations };
