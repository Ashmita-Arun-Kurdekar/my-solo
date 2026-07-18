const {
  getAllProjects,
  getProjectsByManager,
  getProjectsByEmployee,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} = require("../models/projectModel");
const { getManagers } = require("../models/employeeModel");
const { getAllDepartments } = require("../models/departmentModel");

const PROJECT_STATUSES = ["Active", "Completed", "On Hold"];

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
      result = await getProjectsByEmployee(employee_id);
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

    const normalized = normalizeProjectPayload(req.body);

    const validationError = await validateProject(normalized);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (Number(req.user.role_id) === 2 && normalized.manager_id !== Number(req.user.employee_id)) return res.status(403).json({ success: false, message: "Managers can only create projects assigned to themselves." });

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

    const validationError = await validateProject(normalized);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const current = await getProjectById(id);
    if (!current.rows.length) return res.status(404).json({ success: false, message: "Project not found" });
    if (Number(req.user.role_id) === 2 && Number(current.rows[0].manager_id) !== Number(req.user.employee_id)) return res.status(403).json({ success: false, message: "You can only update your assigned projects." });
    if (Number(req.user.role_id) === 2 && normalized.manager_id !== Number(req.user.employee_id)) return res.status(403).json({ success: false, message: "Managers cannot reassign a project to another manager." });

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

    const current = await getProjectById(id);
    if (!current.rows.length) return res.status(404).json({ success: false, message: "Project not found" });
    if (Number(req.user.role_id) === 2 && Number(current.rows[0].manager_id) !== Number(req.user.employee_id)) return res.status(403).json({ success: false, message: "You can only delete your assigned projects." });
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

    if (error.code === "23503") {
      return res.status(409).json({ success: false, message: "This project has assigned tasks and cannot be deleted until those tasks are removed." });
    }

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

const validateProjectReferences = async ({ manager_id, department_id }) => {
  const [managers, departments] = await Promise.all([getManagers(), getAllDepartments()]);

  if (!managers.rows.some((manager) => Number(manager.employee_id) === manager_id)) {
    return "Select a valid manager.";
  }

  if (!departments.rows.some((department) => Number(department.department_id) === department_id)) {
    return "Select a valid department.";
  }

  return null;
};

const validateProject = async (project) => {
  if (!project.project_name) return "Project name is required.";
  if (!project.manager_id || !project.department_id || !project.start_date || !project.end_date) {
    return "Manager, department, start date, and end date are required.";
  }
  if (project.end_date < project.start_date) return "End date cannot be before the start date.";
  if (!PROJECT_STATUSES.includes(project.status)) return "Invalid project status.";

  return validateProjectReferences(project);
};

module.exports = {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getProjectByIdController,
  normalizeProjectPayload,
  authorizeProjectAccess,
  validateProject,
};
