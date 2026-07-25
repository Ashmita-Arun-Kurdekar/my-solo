-- Create the notifications table used by task assignment alerts.
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(30) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_employee_id
  ON notifications(employee_id);

CREATE INDEX IF NOT EXISTS idx_notifications_employee_read
  ON notifications(employee_id, is_read, created_at DESC);