import { motion } from "../lib/motionShim";

function Navbar() {
  const employee = JSON.parse(localStorage.getItem("employee") || "null");

  return (
    <motion.nav initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="navbar px-4 py-3 border-bottom" style={{ background: "rgba(7, 14, 29, 0.7)", backdropFilter: "blur(16px)" }}>
      <div className="d-flex align-items-center gap-2">
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c8cff, #4dd4c6)" }}>
          <i className="bi bi-stars" />
        </div>
        <div>
          <div className="fw-semibold text-white">Company Work Allocation System</div>
          <div className="small text-white-50">Premium operations workspace</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-outline-light btn-sm rounded-pill"><i className="bi bi-bell me-2" />Alerts</button>
        <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill glass-panel">
          <div className="rounded-circle" style={{ width: 32, height: 32, background: "linear-gradient(135deg, #ff7a90, #7c8cff)" }} />
          <div>
            <div className="fw-semibold small text-white">{employee?.name || "User"}</div>
            <div className="small text-white-50">{employee?.email || "team@company.com"}</div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;