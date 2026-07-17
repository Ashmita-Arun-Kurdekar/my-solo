import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EmployeeNavbar() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  return <nav className="navbar px-4 py-3 border-bottom" style={{ background: "rgba(7, 14, 29, .7)", backdropFilter: "blur(16px)" }}>
    <div><div className="fw-semibold text-white">My Workspace</div><div className="small text-white-50">Your work, priorities, and progress</div></div>
    <div className="d-flex align-items-center gap-3"><Link className="btn btn-outline-light btn-sm rounded-pill" to="/employee/notifications"><i className="bi bi-bell me-1" />Notifications</Link><div className="small text-end d-none d-sm-block"><div className="text-white fw-semibold">{user?.name || user?.full_name || "Employee"}</div><div className="text-white-50">Employee</div></div><button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => { logout(); navigate("/login", { replace: true }); }}><i className="bi bi-box-arrow-right me-1" />Logout</button></div>
  </nav>;
}
