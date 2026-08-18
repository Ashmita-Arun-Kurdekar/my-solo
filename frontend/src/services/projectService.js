import API from "./api";

// Get All Projects
export const getProjects = async () => {
  const response = await API.get("/projects");
  return response.data;
};

// Create Project
export const createProject = async (projectData) => {
  const response = await API.post("/projects", projectData);
  return response.data;
};

// Update Project
export const updateProject = async (id, projectData) => {
  const response = await API.put(`/projects/${id}`, projectData);
  return response.data;
};

// Delete Project
export const deleteProject = async (id) => {
  const response = await API.delete(`/projects/${id}`);
  return response.data;
};

export const getProjectMembers = async (id) => {
  const response = await API.get(`/projects/${id}/members`);
  return response.data;
};

export const addProjectMember = async (projectId, payload) => {
  const response = await API.post(`/projects/${projectId}/members`, payload);
  return response.data;
};

export const removeProjectMember = async (projectId, employeeId) => {
  const response = await API.delete(`/projects/${projectId}/members/${employeeId}`);
  return response.data;
};

export const getAvailableEmployees = async (id) => {
  const response = await API.get(`/projects/${id}/available-employees`);
  return response.data;
};

export const suggestBestEmployee = async (id) => {
  const response = await API.get(`/projects/${id}/suggested-employee`);
  return response.data;
};

// Get Managers
export const getManagers = async () => {
  const response = await API.get("/employees/managers");
  return response.data;
};

// Get Departments
export const getDepartments = async () => {
  const response = await API.get("/departments");
  return response.data;
};