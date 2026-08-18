import API from "./api";

export const predictAllRoles = async () => (await API.post("/predict-all")).data;
export const autoAssignProject = async (projectId) => (await API.post(`/projects/${projectId}/auto-assign`)).data;
export const getAllocations = async (projectId) => (await API.get("/allocations", { params: projectId ? { projectId } : {} })).data;
export const recommendForTask = async (task) => (await API.post("/allocation/recommend-task", task)).data;
export const getMlHealth = async () => (await API.get("/allocation/ml-health")).data;
