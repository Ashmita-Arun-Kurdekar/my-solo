const {
  getAllProjects,
  getProjectsByManager,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} = require("../models/projectModel");

const normalizeProjectPayload = (payload = {}) => {
  const parseOptionalNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return {
    project_name: payload.project_name?.toString().trim() || "",
    description: payload.description?.toString().trim() || "",
    manager_id: parseOptionalNumber(payload.manager_id),
    department_id: parseOptionalNumber(payload.department_id),
    start_date: payload.start_date?.toString().trim() || null,
    end_date: payload.end_date?.toString().trim() || null,
    status: payload.status?.toString().trim() || "Active",
  };
};

const authorizeProjectAccess = (user = {}, action = "read") => {
  const roleId = Number(user?.role_id);

  if (!Number.isInteger(roleId)) {
    return false;
  }

  if (action === "write") {
    return roleId === 1 || roleId === 2;
  }

  return [1, 2, 3].includes(roleId);
};

const getProjects = async (req, res) => {
  try {
    const { employee_id, role_id } = req.user || {};

    if (!authorizeProjectAccess(req.user, "read")) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    let result;

    if (Number(role_id) === 1) {
      result = await getAllProjects();
    } else if (Number(role_id) === 2) {
      result = await getProjectsByManager(employee_id);
    } else {
      result = await getAllProjects();
    }

    res.json({
      success: true,
      projects: result?.rows || [],
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
  console.log("Logged in user:", req.user);

  try {
    if (!authorizeProjectAccess(req.user, "write")) {
      return res.status(403).json({
        success: false,
        message: "Only admins and managers can create projects.",
      });
    }

    // remaining code...

    const normalized = normalizeProjectPayload(req.body);

    // Basic validation
    if (!normalized.project_name || normalized.project_name.length === 0) {
      return res.status(400).json({ success: false, message: "Project name is required." });
    }

    const result = await createProject(
      normalized.project_name,
      normalized.description,
      normalized.manager_id,
      normalized.department_id,
      normalized.start_date,
      normalized.end_date,
      normalized.status
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
    if (!authorizeProjectAccess(req.user, "write")) {
      return res.status(403).json({
        success: false,
        message: "Only admins and managers can update projects.",
      });
    }

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid project id." });
    }

    const normalized = normalizeProjectPayload(req.body);

    if (!normalized.project_name || normalized.project_name.length === 0) {
      return res.status(400).json({ success: false, message: "Project name is required." });
    }

    const result = await updateProject(
      id,
      normalized.project_name,
      normalized.description,
      normalized.manager_id,
      normalized.department_id,
      normalized.start_date,
      normalized.end_date,
      normalized.status
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

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
    if (!authorizeProjectAccess(req.user, "write")) {
      return res.status(403).json({
        success: false,
        message: "Only admins and managers can delete projects.",
      });
    }

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid project id." });
    }

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
// Get single project by id
const getProjectByIdController = async (req, res) => {
  try {
    if (!authorizeProjectAccess(req.user, "read")) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ success: false, message: "Invalid project id." });
    }

    const result = await getProjectById(id);

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getProjectByIdController,
  normalizeProjectPayload,
  authorizeProjectAccess,
};