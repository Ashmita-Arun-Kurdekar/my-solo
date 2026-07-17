import API from "./api";

export const getEmployees = async () => {
  const response = await API.get("/employees");
  return response.data;
};

export const deleteEmployee = async (id) => {
  return await API.delete(`/employees/${id}`);
};

export const updateEmployee = async (id, employeeData) => {
  return await API.put(`/employees/${id}`, employeeData);
};
export const createEmployee = async (employeeData) => (await API.post("/employees", employeeData)).data;
