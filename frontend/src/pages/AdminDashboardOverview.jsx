import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../services/employeeService";
import { getProjects } from "../services/projectService";
import { getTasks } from "../services/taskService";

export default function AdminDashboardOverview() {
  const [data, setData] = useState({ people: [], projects: [], tasks: [] });
  useEffect(() => { Promise.all([getEmployees(), getProjects(), getTasks()]).then(([people, projects, tasks]) => setData({ people: people.employees || [], projects: projects.projects || [], tasks: tasks.tasks || [] })); }, []);
  const stats = useMemo(() => ({
    employees: data.people.filter((person) => Number(person.role_id) === 3).length,
    managers: data.people.filter((person) => Number(person.role_id) === 2).length,
    admin: data.people.filter((person) => Number(person.role_id) === 1).length,
    projects: data.projects.length,
    pending: data.tasks.filter((task) => task.status === "Pending").length,
    completed: data.tasks.filter((task) => task.status === "Completed").length,
  }), [data]);
  const cards = [["Total Accounts", data.people.length, "bi-people", "primary"], ["Employees", stats.employees, "bi-person", "info"], ["Managers", stats.managers, "bi-person-workspace", "success"], ["Admin Accounts", stats.admin, "bi-shield-check", "secondary"], ["Projects", stats.projects, "bi-folder2-open", "primary"], ["Pending Tasks", stats.pending, "bi-hourglass-split", "warning"], ["Completed Tasks", stats.completed, "bi-check-circle", "success"]];
  return <><section className="admin-hero mb-4"><div><span className="badge text-bg-light text-primary mb-2">ADMIN DASHBOARD</span><h1>Welcome back, Administrator</h1><p>Monitor people, work, and delivery across the organization.</p></div><div className="d-flex gap-2"><Link to="/admin/employees" className="btn btn-outline-light">Manage employees</Link><Link to="/admin/projects" className="btn btn-primary">New project</Link></div></section><div className="row g-3 mb-4">{cards.map(([label, value, icon, color]) => <div className="col-6 col-md-4 col-xl" key={label}><div className="admin-stat"><span className={`text-bg-${color}`}><i className={`bi ${icon}`} /></span><strong>{value}</strong><small>{label}</small></div></div>)}</div><div className="admin-panel"><h5 className="mb-3">Account breakdown</h5><p className="text-white-50 mb-0">Total Accounts includes administrators, managers, and employees. The Employees page displays only employee accounts; managers have their own page.</p></div></>;
}
