import { motion } from "../lib/motionShim";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", icon: "bi-grid-1x2" },
  { to: "/employees", label: "Employees", icon: "bi-people" },
  { to: "/projects", label: "Projects", icon: "bi-briefcase" },
  { to: "/tasks", label: "Tasks", icon: "bi-check2-square" },
  { to: "/settings", label: "Settings", icon: "bi-gear" },
];

function SidebarAdmin() {
  const location = useLocation();
  const employee = JSON.parse(localStorage.getItem("employee") || sessionStorage.getItem("employee") || "null");

  return (
    <motion.aside initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }} className="sidebar-shell text-white p-3 d-flex flex-column">
      <div className="mb-4 p-3 rounded-4 glass-panel">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: "linear-gradient(135deg, #7c8cff, #4dd4c6)" }}>
            <i className="bi bi-shield-lock-fill" />
          </div>
          <div>
            <div className="fw-semibold">Admin Console</div>
            <div className="small opacity-75">Organization Settings</div>
          </div>
        </div>
        <div className="small opacity-75">{employee?.name || "Administrator"}</div>
      </div>

      <ul className="nav flex-column gap-2">
        {links.map((item) => {
          const active = location.pathname === item.to;
          return (
            <li key={item.to} className="nav-item">
              <Link className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${active ? "active" : "text-white-50"}`} to={item.to} style={{ background: active ? "rgba(124,140,255,0.16)" : "transparent" }}>
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto p-3 rounded-4 glass-panel">
        <div className="small text-uppercase opacity-75 mb-2">Admin</div>
        <div className="fw-semibold">Organization</div>
      </div>
    </motion.aside>
  );
}

export default SidebarAdmin;
