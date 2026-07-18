import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ManagerNavbar() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const initials = (user?.name || "Manager").split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <nav className="manager-navbar px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between">
    <div><div className="fw-semibold text-white">Manager Workspace</div><div className="small text-white-50">Team delivery at a glance</div></div>
    <div className="d-flex align-items-center gap-2 gap-lg-3"><Link className="btn btn-sm btn-outline-light rounded-circle" to="/manager/notifications" aria-label="Notifications"><i className="bi bi-bell" /></Link><Link className="text-decoration-none d-flex align-items-center gap-2" to="/manager/profile"><span className="manager-avatar">{initials}</span><span className="d-none d-md-block"><span className="d-block text-white small fw-semibold">{user?.name || "Manager"}</span><span className="d-block text-white-50 small">Manager</span></span></Link><button className="btn btn-sm btn-outline-danger" onClick={() => { logout(); navigate("/login", { replace: true }); }}><i className="bi bi-box-arrow-right d-lg-none" /><span className="d-none d-lg-inline">Logout</span></button></div>
  </nav>;
}
