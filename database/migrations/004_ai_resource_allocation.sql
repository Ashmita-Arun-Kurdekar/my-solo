-- AI allocation domain. This migration is idempotent and augments the existing schema.
CREATE TABLE IF NOT EXISTS employee_profiles (
  employee_id INTEGER PRIMARY KEY REFERENCES employees(employee_id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}', certifications TEXT[] NOT NULL DEFAULT '{}',
  education TEXT, preferred_domain TEXT, previous_projects TEXT[] NOT NULL DEFAULT '{}',
  experience_years NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  current_workload INTEGER NOT NULL DEFAULT 0 CHECK (current_workload BETWEEN 0 AND 100),
  availability_status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available','Busy','Unavailable')),
  profile_picture_url TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS required_skills TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS required_roles TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(12) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS maximum_team_size INTEGER NOT NULL DEFAULT 5 CHECK (maximum_team_size > 0);
CREATE TABLE IF NOT EXISTS prediction_history (
  prediction_id BIGSERIAL PRIMARY KEY, employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  predicted_role VARCHAR(80) NOT NULL, confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  matching_skills TEXT[] NOT NULL DEFAULT '{}', reason TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id BIGSERIAL PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  predicted_role VARCHAR(80) NOT NULL, allocation_score INTEGER NOT NULL CHECK (allocation_score BETWEEN 0 AND 100),
  explanation TEXT NOT NULL, allocation_source VARCHAR(20) NOT NULL DEFAULT 'auto', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, employee_id)
);
CREATE INDEX IF NOT EXISTS idx_prediction_history_employee ON prediction_history(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_allocations_project ON allocations(project_id);
