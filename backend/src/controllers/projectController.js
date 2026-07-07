const {
  getAllProjects,
  getProjectsByManager,
  createProject,
  updateProject,
  deleteProject,
} = require("../models/projectModel");

const getProjects = async (req, res) => {
  try {
    const { employee_id, role_id } = req.user;

    let result;

    // Admin
    if (role_id === 1) {
      result = await getAllProjects();
    }
    // Manager
    else if (role_id === 2) {
      result = await getProjectsByManager(employee_id);
    }
    // Employee
    else {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.json({
      success: true,
      projects: result.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Project
const addProject = async (req, res) => {
  try {
    const {
      project_name,
      description,
      manager_id,
      department_id,
      start_date,
      end_date,
      status,
    } = req.body;

    const result = await createProject(
      project_name,
      description,
      manager_id,
      department_id,
      start_date,
      end_date,
      status
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update Project
const editProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      project_name,
      description,
      manager_id,
      department_id,
      start_date,
      end_date,
      status,
    } = req.body;

    const result = await updateProject(
      id,
      project_name,
      description,
      manager_id,
      department_id,
      start_date,
      end_date,
      status
    );

    res.json({
      success: true,
      project: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Project
const removeProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteProject(id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
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
  getProjects,
  addProject,
  editProject,
  removeProject,
};