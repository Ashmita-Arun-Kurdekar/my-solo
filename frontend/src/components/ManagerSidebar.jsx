import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["/manager", "Dashboard", "bi-grid-1x2"], ["/manager/projects", "My Projects", "bi-folder2-open"], ["/manager/tasks", "Team Tasks", "bi-list-check"], ["/manager/team", "My Team", "bi-people"], ["/manager/calendar", "Calendar", "bi-calendar3"], ["/manager/notifications", "Notifications", "bi-bell"], ["/manager/profile", "My Profile", "bi-person-circle"],
];
export default function ManagerSidebar() {
  const { user, logout } = useAuth();
  return <aside className="manager-sidebar d-flex flex-column p-3"><div className="manager-brand mb-4"><span className="manager-brand-mark"><i className="bi bi-kanban-fill" /></span><div><strong>FlowBoard</strong><small>Manager portal</small></div></div><div className="small text-uppercase text-white-50 px-2 mb-2">Workspace</div><nav className="nav flex-column gap-1">{links.map(([to, label, icon]) => <NavLink end={to === "/manager"} key={to} to={to} className="manager-nav-link"><i className={`bi ${icon}`} /><span>{label}</span></NavLink>)}</nav><div className="mt-auto manager-user-card"><div className="small text-white-50">Signed in as</div><div className="fw-semibold text-truncate">{user?.name || "Manager"}</div><button className="btn btn-link text-danger p-0 mt-2 text-decoration-none small" onClick={logout}><i className="bi bi-box-arrow-right me-1" />Logout</button></div></aside>;
}
