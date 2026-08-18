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

const getEmployeeWorkload = (employeeId) => pool.query(`
  SELECT e.employee_id, e.full_name,
    COUNT(t.task_id) AS total_tasks,
    COUNT(*) FILTER (WHERE t.status IN ('Pending', 'In Progress')) AS active_tasks,
    COUNT(*) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
    COUNT(*) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_tasks,
    COALESCE(p.current_workload, 0) AS current_workload
  FROM employees e
  LEFT JOIN tasks t ON t.assigned_to = e.employee_id
  LEFT JOIN employee_profiles p ON p.employee_id = e.employee_id
  WHERE e.employee_id = $1
  GROUP BY e.employee_id, e.full_name, p.current_workload`, [employeeId]);

const getAvailableEmployees = (projectId) => pool.query(`
  WITH current_team AS (
    SELECT employee_id FROM project_members WHERE project_id = $1
  ), workload AS (
    SELECT e.employee_id,
      COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending', 'In Progress')) AS active_tasks,
      COUNT(t.task_id) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
      COUNT(t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE) AS overdue_tasks,
      COALESCE(p.current_workload, 0) AS current_workload,
      COALESCE(p.availability_status, 'Available') AS availability_status
    FROM employees e
    LEFT JOIN tasks t ON t.assigned_to = e.employee_id
    LEFT JOIN employee_profiles p ON p.employee_id = e.employee_id
    WHERE e.role_id = 3
    GROUP BY e.employee_id, p.current_workload, p.availability_status
  )
  SELECT e.employee_id, e.full_name, e.email, e.department_id, e.designation, d.department_name,
    w.active_tasks, w.completed_tasks, w.overdue_tasks, w.current_workload, w.availability_status
  FROM employees e
  JOIN workload w ON w.employee_id = e.employee_id
  LEFT JOIN departments d ON d.department_id = e.department_id
  WHERE e.role_id = 3 AND NOT EXISTS (SELECT 1 FROM current_team team WHERE team.employee_id = e.employee_id)
  ORDER BY w.active_tasks ASC, w.overdue_tasks ASC, w.current_workload ASC, e.full_name ASC`, [projectId]);

const suggestBestEmployee = async (projectId) => {
  const result = await getAvailableEmployees(projectId);
  return result.rows[0] || null;
};

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

const getTaskRecommendationCandidates = (projectId) => pool.query(`
  SELECT e.employee_id, e.full_name AS employee_name,
    CASE WHEN e.department_id = project.department_id THEN 1 ELSE 0 END AS department_match,
    COALESCE(e.designation, 'Unknown') AS designation,
    COALESCE(profile.experience_years, 0)::float AS experience_years,
    COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending', 'In Progress'))::int AS active_tasks,
    COUNT(t.task_id) FILTER (WHERE t.status = 'Completed')::int AS completed_tasks,
    COUNT(t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE)::int AS overdue_tasks,
    COALESCE(AVG(CASE WHEN t.status = 'Completed' THEN CASE WHEN t.completed_date <= t.due_date THEN 1.0 ELSE 0.0 END END), 0)::float AS completion_rate,
    COALESCE(AVG(t.completed_date - t.assigned_date) FILTER (WHERE t.status = 'Completed' AND t.completed_date IS NOT NULL), 0)::float AS average_completion_days,
    COUNT(t.task_id) FILTER (WHERE t.status = 'Completed' AND task_project.department_id = project.department_id)::int AS similar_tasks_completed,
    LEAST(100, COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending', 'In Progress')) * 20)::float AS current_workload,
    CASE WHEN COALESCE(profile.availability_status, 'Available') = 'Unavailable' THEN 'Unavailable'
      WHEN COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending', 'In Progress')) >= 4 THEN 'Busy'
      ELSE COALESCE(profile.availability_status, 'Available') END AS availability_status
  FROM project_members member
  JOIN projects project ON project.project_id = member.project_id
  JOIN employees e ON e.employee_id = member.employee_id
  LEFT JOIN employee_profiles profile ON profile.employee_id = e.employee_id
  LEFT JOIN tasks t ON t.assigned_to = e.employee_id
  LEFT JOIN projects task_project ON task_project.project_id = t.project_id
  WHERE member.project_id = $1 AND e.role_id = 3
  GROUP BY e.employee_id, e.full_name, e.department_id, e.designation, project.department_id,
    profile.experience_years, profile.availability_status
  ORDER BY e.full_name`, [projectId]);

module.exports = { getEmployeeProfiles, getEmployeeProfile, getProjectRequirements, getEmployeeWorkload, getAvailableEmployees, suggestBestEmployee, savePrediction, replaceAllocations, getAllocations, getTaskRecommendationCandidates };
