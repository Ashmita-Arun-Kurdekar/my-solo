-- Align the legacy tasks table with backend/src/models/taskModel.js.
-- The statements are safe to run more than once.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS task_title TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to INTEGER,
  ADD COLUMN IF NOT EXISTS assigned_by INTEGER,
  ADD COLUMN IF NOT EXISTS assigned_date DATE,
  ADD COLUMN IF NOT EXISTS completed_date DATE;

-- Preserve data created with the older title/employee_id column names.
UPDATE tasks
SET
  task_title = COALESCE(task_title, title),
  assigned_to = COALESCE(assigned_to, employee_id),
  assigned_date = COALESCE(assigned_date, created_at::date, CURRENT_DATE)
WHERE task_title IS NULL OR assigned_to IS NULL OR assigned_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
