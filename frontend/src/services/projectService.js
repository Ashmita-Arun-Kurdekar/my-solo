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