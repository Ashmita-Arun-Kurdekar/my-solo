-- Add project membership and task update tracking without changing existing tables.
CREATE TABLE IF NOT EXISTS project_members (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
  role_in_project VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role_in_project IN ('member', 'lead')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee_id ON project_members(employee_id);

CREATE TABLE IF NOT EXISTS task_updates (
  update_id BIGSERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  status VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON task_updates(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_updates_employee_id ON task_updates(employee_id, created_at DESC);