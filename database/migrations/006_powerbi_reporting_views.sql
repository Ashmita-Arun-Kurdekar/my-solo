-- Power BI semantic layer. Read-only views; no application data is changed.
CREATE OR REPLACE VIEW bi_task_fact AS
SELECT
  t.task_id, t.project_id, p.project_name, p.department_id, d.department_name,
  p.manager_id, manager.full_name AS manager_name,
  t.assigned_to AS employee_id, employee.full_name AS employee_name,
  employee.designation, t.task_title, t.priority, t.status,
  t.assigned_date, t.due_date, t.completed_date,
  CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END AS is_completed,
  CASE WHEN t.status <> 'Completed' AND t.due_date < CURRENT_DATE THEN 1 ELSE 0 END AS is_overdue,
  CASE WHEN t.status = 'Completed' AND t.completed_date <= t.due_date THEN 1 ELSE 0 END AS completed_on_time,
  CASE WHEN t.completed_date IS NOT NULL AND t.assigned_date IS NOT NULL THEN t.completed_date - t.assigned_date END AS completion_days,
  CASE WHEN t.due_date IS NOT NULL THEN t.due_date - CURRENT_DATE END AS days_to_deadline,
  t.created_at
FROM tasks t
LEFT JOIN projects p ON p.project_id = t.project_id
LEFT JOIN departments d ON d.department_id = p.department_id
LEFT JOIN employees employee ON employee.employee_id = t.assigned_to
LEFT JOIN employees manager ON manager.employee_id = p.manager_id;

CREATE OR REPLACE VIEW bi_employee_workload AS
SELECT
  e.employee_id, e.full_name, e.email, e.designation, e.role_id,
  e.department_id, d.department_name,
  COUNT(t.task_id)::int AS total_tasks,
  COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending','In Progress'))::int AS active_tasks,
  COUNT(t.task_id) FILTER (WHERE t.status = 'Completed')::int AS completed_tasks,
  COUNT(t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE)::int AS overdue_tasks,
  COALESCE(ROUND(100.0 * COUNT(t.task_id) FILTER (WHERE t.status = 'Completed') / NULLIF(COUNT(t.task_id),0), 1), 0) AS completion_rate_pct,
  COALESCE(ROUND(100.0 * COUNT(t.task_id) FILTER (WHERE t.status = 'Completed' AND t.completed_date <= t.due_date) / NULLIF(COUNT(t.task_id) FILTER (WHERE t.status = 'Completed'),0), 1), 0) AS on_time_rate_pct,
  LEAST(100, COUNT(t.task_id) FILTER (WHERE t.status IN ('Pending','In Progress')) * 20)::int AS derived_workload_pct,
  COALESCE(profile.experience_years, 0) AS experience_years,
  COALESCE(profile.availability_status, 'Available') AS availability_status,
  COUNT(DISTINCT pm.project_id)::int AS project_count
FROM employees e
LEFT JOIN departments d ON d.department_id = e.department_id
LEFT JOIN tasks t ON t.assigned_to = e.employee_id
LEFT JOIN employee_profiles profile ON profile.employee_id = e.employee_id
LEFT JOIN project_members pm ON pm.employee_id = e.employee_id
GROUP BY e.employee_id, d.department_name, profile.experience_years, profile.availability_status;

CREATE OR REPLACE VIEW bi_project_performance AS
SELECT
  p.project_id, p.project_name, p.description, p.status, p.priority,
  p.department_id, d.department_name, p.manager_id, manager.full_name AS manager_name,
  p.start_date, p.end_date,
  COUNT(DISTINCT pm.employee_id)::int AS team_size,
  COUNT(DISTINCT t.task_id)::int AS total_tasks,
  COUNT(DISTINCT t.task_id) FILTER (WHERE t.status = 'Completed')::int AS completed_tasks,
  COUNT(DISTINCT t.task_id) FILTER (WHERE t.status IN ('Pending','In Progress'))::int AS active_tasks,
  COUNT(DISTINCT t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE)::int AS overdue_tasks,
  COALESCE(ROUND(100.0 * COUNT(DISTINCT t.task_id) FILTER (WHERE t.status = 'Completed') / NULLIF(COUNT(DISTINCT t.task_id),0), 1), 0) AS progress_pct,
  CASE WHEN p.end_date < CURRENT_DATE AND p.status <> 'Completed' THEN 'At Risk'
       WHEN COUNT(DISTINCT t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE) > 0 THEN 'Watch'
       ELSE 'Healthy' END AS health
FROM projects p
LEFT JOIN departments d ON d.department_id = p.department_id
LEFT JOIN employees manager ON manager.employee_id = p.manager_id
LEFT JOIN project_members pm ON pm.project_id = p.project_id
LEFT JOIN tasks t ON t.project_id = p.project_id
GROUP BY p.project_id, d.department_name, manager.full_name;

CREATE OR REPLACE VIEW bi_department_performance AS
SELECT
  d.department_id, d.department_name,
  COUNT(DISTINCT e.employee_id) FILTER (WHERE e.role_id = 3)::int AS employee_count,
  COUNT(DISTINCT p.project_id)::int AS project_count,
  COUNT(DISTINCT t.task_id)::int AS task_count,
  COUNT(DISTINCT t.task_id) FILTER (WHERE t.status = 'Completed')::int AS completed_tasks,
  COUNT(DISTINCT t.task_id) FILTER (WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE)::int AS overdue_tasks,
  COALESCE(ROUND(100.0 * COUNT(DISTINCT t.task_id) FILTER (WHERE t.status = 'Completed') / NULLIF(COUNT(DISTINCT t.task_id),0), 1), 0) AS completion_rate_pct
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
LEFT JOIN projects p ON p.department_id = d.department_id
LEFT JOIN tasks t ON t.project_id = p.project_id
GROUP BY d.department_id;

CREATE OR REPLACE VIEW bi_allocation_outcomes AS
SELECT
  a.allocation_id, a.project_id, p.project_name, a.employee_id, e.full_name AS employee_name,
  a.predicted_role, a.allocation_score, a.explanation, a.allocation_source, a.created_at,
  COUNT(t.task_id)::int AS assigned_tasks,
  COUNT(t.task_id) FILTER (WHERE t.status = 'Completed')::int AS completed_tasks,
  COUNT(t.task_id) FILTER (WHERE t.status = 'Completed' AND t.completed_date <= t.due_date)::int AS completed_on_time
FROM allocations a
JOIN projects p ON p.project_id = a.project_id
JOIN employees e ON e.employee_id = a.employee_id
LEFT JOIN tasks t ON t.project_id = a.project_id AND t.assigned_to = a.employee_id
GROUP BY a.allocation_id, p.project_name, e.full_name;
