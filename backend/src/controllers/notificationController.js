const notifications = require("../models/notificationModel");

const getMyNotifications = async (req, res) => {
  try {
    const employeeId = Number(req.user?.employee_id);

    if (!Number.isInteger(employeeId)) {
      return res.status(400).json({ success: false, message: "Invalid user context." });
    }

    const [notificationResult, unreadResult] = await Promise.all([
      notifications.getNotificationsForEmployee(employeeId),
      notifications.getUnreadNotificationCount(employeeId),
    ]);

    res.json({
      success: true,
      notifications: notificationResult.rows,
      unreadCount: unreadResult.rows[0]?.unread_count || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const employeeId = Number(req.user?.employee_id);

    if (!Number.isInteger(employeeId)) {
      return res.status(400).json({ success: false, message: "Invalid user context." });
    }

    const result = await notifications.markNotificationAsRead(req.params.id, employeeId);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
};