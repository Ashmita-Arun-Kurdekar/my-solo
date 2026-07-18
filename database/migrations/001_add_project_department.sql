-- Adds the department relationship expected by backend/src/models/projectModel.js.
-- Safe to run more than once in pgAdmin or psql.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS department_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_department_id_fkey'
      AND conrelid = 'projects'::regclass
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT projects_department_id_fkey
      FOREIGN KEY (department_id)
      REFERENCES departments(department_id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_department_id
  ON projects(department_id);
