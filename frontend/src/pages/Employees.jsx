import { useEffect, useState } from "react";
import {
  getEmployees,
  deleteEmployee,
  updateEmployee,
} from "../services/employeeService";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [editingEmployee, setEditingEmployee] = useState(null);

  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    designation: "",
    department_id: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.employees);
    } catch (error) {
      console.error(error);
      alert("Failed to load employees");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);

      alert("Employee deleted successfully.");

      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee.");
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);

    setEditForm({
      full_name: employee.full_name,
      phone: employee.phone,
      designation: employee.designation,
      department_id: employee.department_id,
    });
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateEmployee(
        editingEmployee.employee_id,
        editForm
      );

      alert("Employee updated successfully.");

      setEditingEmployee(null);

      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to update employee.");
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container mt-4">

          <h2 className="mb-4">Employees</h2>

          <table className="table table-bordered table-striped shadow">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Department</th>
                <th width="180">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.role_id}</td>
                    <td>{emp.department_id}</td>

                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEditClick(emp)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp.employee_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Employees Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editingEmployee && (
            <div className="card shadow mt-4 p-4">

              <h4 className="mb-3">Edit Employee</h4>

              <input
                className="form-control mb-3"
                name="full_name"
                value={editForm.full_name}
                onChange={handleInputChange}
                placeholder="Full Name"
              />

              <input
                className="form-control mb-3"
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
                placeholder="Phone"
              />

              <input
                className="form-control mb-3"
                name="designation"
                value={editForm.designation}
                onChange={handleInputChange}
                placeholder="Designation"
              />

              <input
                className="form-control mb-3"
                name="department_id"
                value={editForm.department_id}
                onChange={handleInputChange}
                placeholder="Department ID"
              />

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={handleUpdate}
                >
                  Update Employee
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingEmployee(null)}
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Employees;