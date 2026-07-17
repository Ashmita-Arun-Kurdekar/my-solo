import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import SidebarAdmin from "../components/SidebarAdmin";
import SidebarManager from "../components/SidebarManager";
import SidebarEmployee from "../components/SidebarEmployee";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getManagers,
  getDepartments,
} from "../services/projectService";

function Projects() {
  const { user } = useAuth();
  const canManage = [1, 2].includes(Number(user?.role));
  const Sidebar = Number(user?.role) === 1 ? SidebarAdmin : Number(user?.role) === 2 ? SidebarManager : SidebarEmployee;
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    manager_id: "",
    department_id: "",
    start_date: "",
    end_date: "",
    status: "Active",
  });

  useEffect(() => {
    fetchProjects();
    if (canManage) {
      fetchManagers();
      fetchDepartments();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load projects");
    }
  };

  const fetchManagers = async () => {
    try {
      const data = await getManagers();
      setManagers(Array.isArray(data?.managers) ? data.managers : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
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

  // Create Project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_name.trim() || !formData.manager_id || !formData.department_id || !formData.start_date || !formData.end_date) {
      return alert("Project name, manager, department, start date, and end date are required.");
    }
    if (formData.end_date < formData.start_date) return alert("End date cannot be before the start date.");

    try {
      await createProject(formData);

      alert("Project created successfully.");

      resetForm();

      fetchProjects();

    } catch (error) {
      console.error(error);
      alert("Failed to create project.");
    }
  };

  // Edit Project
  const handleEdit = (project) => {
    setEditingProject(project);

    setFormData({
      project_name: project.project_name,
      description: project.description,
      manager_id: project.manager_id,
      department_id: project.department_id,
      start_date: project.start_date?.substring(0, 10),
      end_date: project.end_date?.substring(0, 10),
      status: project.status,
    });
  };

  // Update Project
  const handleUpdate = async () => {
    if (!formData.project_name.trim() || !formData.manager_id || !formData.department_id || !formData.start_date || !formData.end_date) return alert("Project name, manager, department, start date, and end date are required.");
    if (formData.end_date < formData.start_date) return alert("End date cannot be before the start date.");
    try {
      await updateProject(editingProject.project_id, formData);

      alert("Project updated successfully.");

      setEditingProject(null);

      resetForm();

      fetchProjects();

    } catch (error) {
      console.error(error);
      alert("Failed to update project.");
    }
  };

  // Delete Project
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await deleteProject(id);

      alert("Project deleted successfully.");

      fetchProjects();

    } catch (error) {
      console.error(error);
      alert("Failed to delete project.");
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: "",
      description: "",
      manager_id: "",
      department_id: "",
      start_date: "",
      end_date: "",
      status: "Active",
    });
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container mt-4">

          <h2 className="mb-4">Projects</h2>

          {canManage && <div className="card shadow p-4 mb-4">

            <h4>
              {editingProject ? "Edit Project" : "Create Project"}
            </h4>

            <form
              onSubmit={
                editingProject
                  ? (e) => e.preventDefault()
                  : handleSubmit
              }
            >

              <input
                className="form-control mb-3"
                placeholder="Project Name"
                name="project_name"
                value={formData.project_name}
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
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
              >
                <option value="">Select Manager</option>

                {managers.filter((manager) => Number(user?.role) === 1 || Number(manager.employee_id) === Number(user?.id)).map((manager) => (
                  <option
                    key={manager.employee_id}
                    value={manager.employee_id}
                  >
                    {manager.full_name}
                  </option>
                ))}
              </select>

              <select
                className="form-control mb-3"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">Select Department</option>

                {departments.map((department) => (
                  <option
                    key={department.department_id}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </option>
                ))}
              </select>

              <input
                className="form-control mb-3"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />

              <input
                className="form-control mb-3"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />

              <select
                className="form-control mb-3"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              {editingProject ? (
                <>
                  <button
                    type="button"
                    className="btn btn-warning me-2"
                    onClick={handleUpdate}
                  >
                    Update Project
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingProject(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Create Project
                </button>
              )}

            </form>

          </div>}

          <table className="table table-bordered table-striped shadow">

            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Manager</th>
                <th>Department</th>
                <th>Status</th>
                {canManage && <th width="180">Actions</th>}
              </tr>
            </thead>

            <tbody>

              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.project_id}>
                    <td>{project.project_id}</td>
                    <td>{project.project_name}</td>
                    <td>{project.manager}</td>
                    <td>{project.department_name}</td>
                    <td>{project.status}</td>

                    {canManage && <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(project)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleDelete(project.project_id)
                        }
                      >
                        Delete
                      </button>
                    </td>}

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? "6" : "5"} className="text-center">
                    No Projects Found
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

export default Projects;
