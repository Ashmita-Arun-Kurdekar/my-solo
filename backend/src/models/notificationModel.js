const pool = require("../config/db");

const ensureNotificationsTable = async () => {
  await pool.query(`
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
  `);
};

const getNotificationsForEmployee = async (employeeId) => {
  await ensureNotificationsTable();
  const query = `
    SELECT
      notification_id,
      employee_id,
      title,
      message,
      notification_type,
      is_read,
      created_at
    FROM notifications
    WHERE employee_id = $1
    ORDER BY is_read ASC, created_at DESC, notification_id DESC;
  `;

  return await pool.query(query, [employeeId]);
};

const getUnreadNotificationCount = async (employeeId) => {
  await ensureNotificationsTable();
  const query = `
    SELECT COUNT(*)::int AS unread_count
    FROM notifications
    WHERE employee_id = $1 AND is_read = FALSE;
  `;

  return await pool.query(query, [employeeId]);
};

const createNotification = async (employeeId, title, message, notificationType) => {
  await ensureNotificationsTable();
  const query = `
    INSERT INTO notifications (employee_id, title, message, notification_type)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  return await pool.query(query, [employeeId, title, message, notificationType]);
};

const markNotificationAsRead = async (notificationId, employeeId) => {
  await ensureNotificationsTable();
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE notification_id = $1 AND employee_id = $2
    RETURNING *;
  `;

  return await pool.query(query, [notificationId, employeeId]);
};

module.exports = {
  getNotificationsForEmployee,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
};