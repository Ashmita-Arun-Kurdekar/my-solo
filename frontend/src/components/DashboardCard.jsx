import { motion } from "../lib/motionShim";

function DashboardCard({ title, value, icon }) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} className="card border-0 p-4 soft-card" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(14px)" }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="text-uppercase small opacity-75 mb-2">{title}</div>
          <div className="display-6 fw-semibold">{value}</div>
        </div>
        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "rgba(124,140,255,0.16)" }}>
          <i className={`bi ${icon} fs-4`} />
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardCard;