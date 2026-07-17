import API from "./api";

// Tasks
export const getTasks = async () => {
  const response = await API.get("/tasks");
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await API.post("/tasks", taskData);
  return response.data;
};

// Projects
export const getProjects = async () => {
  const response = await API.get("/projects");
  return response.data;
};

// Employees
export const getEmployees = async () => {
  const response = await API.get("/employees");
  return response.data;
};
export const updateTask = async (id, taskData) => (await API.put(`/tasks/${id}`, taskData)).data;
export const deleteTask = async (id) => (await API.delete(`/tasks/${id}`)).data;
export const updateTaskStatus = async (id, status) => (await API.patch(`/tasks/${id}/status`, { status })).data;
