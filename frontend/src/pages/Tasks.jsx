import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getTasks,
  createTask,
  getProjects,
  getEmployees,
} from "../services/taskService";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    project_id: "",
    assigned_to: "",
    task_title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    assigned_date: "",
    due_date: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.tasks);
    } catch (error) {
      console.error(error);
      alert("Failed to load tasks");
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.employees);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTask(formData);

      alert("Task created successfully.");

      setFormData({
        project_id: "",
        assigned_to: "",
        task_title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        assigned_date: "",
        due_date: "",
      });

      fetchTasks();

    } catch (error) {
      console.error(error);
      alert("Failed to create task.");
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container mt-4">

          <h2 className="mb-4">Tasks</h2>

          <div className="card shadow p-4 mb-4">

            <h4>Create Task</h4>

            <form onSubmit={handleSubmit}>

              {/* Project Dropdown */}

              <select
                className="form-control mb-3"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">Select Project</option>

                {projects.map((project) => (
                  <option
                    key={project.project_id}
                    value={project.project_id}
                  >
                    {project.project_name}
                  </option>
                ))}
              </select>

              {/* Employee Dropdown */}

              <select
                className="form-control mb-3"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value="">Assign Employee</option>

                {employees.map((employee) => (
                  <option
                    key={employee.employee_id}
                    value={employee.employee_id}
                  >
                    {employee.full_name}
                  </option>
                ))}
              </select>

              <input
                className="form-control mb-3"
                placeholder="Task Title"
                name="task_title"
                value={formData.task_title}
                onChange={handleChange}
              />

              <textarea
                className="form-control mb-3"
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />

              <select
                className="form-control mb-3"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                className="form-control mb-3"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                className="form-control mb-3"
                type="date"
                name="assigned_date"
                value={formData.assigned_date}
                onChange={handleChange}
              />

              <input
                className="form-control mb-3"
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="btn btn-success"
              >
                Create Task
              </button>

            </form>

          </div>

          <table className="table table-bordered table-striped shadow">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.task_id}>
                    <td>{task.task_id}</td>
                    <td>{task.task_title}</td>
                    <td>{task.project_name}</td>
                    <td>{task.assigned_to}</td>
                    <td>{task.assigned_by}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Tasks Found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}

export default Tasks;