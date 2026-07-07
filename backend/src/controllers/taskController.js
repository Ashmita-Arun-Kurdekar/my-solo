const {
  getAllTasks,
  createTask,
} = require("../models/taskModel");

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const result = await getAllTasks();

    res.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Task
const addTask = async (req, res) => {
  try {
    // Only Admin and Manager can assign tasks
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: "Only Admins and Managers can assign tasks.",
      });
    }

    const {
      project_id,
      assigned_to,
      task_title,
      description,
      priority,
      status,
      assigned_date,
      due_date,
    } = req.body;

    // Get Assigned By from JWT
    const assigned_by = req.user.employee_id;

    const result = await createTask(
      project_id,
      assigned_to,
      assigned_by,
      task_title,
      description,
      priority,
      status,
      assigned_date,
      due_date
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTasks,
  addTask,
};