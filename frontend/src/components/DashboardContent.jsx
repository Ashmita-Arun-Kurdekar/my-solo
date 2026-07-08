import { motion } from "../lib/motionShim";
import DashboardCard from "../components/DashboardCard";
import { getDashboardStats } from "../services/dashboardService";
import { useEffect, useState } from "react";

export default function DashboardContent() {
  const [stats, setStats] = useState({ employees: 0, projects: 0, tasks: 0, pending: 0 });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.stats || stats);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container py-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="page-surface p-4 p-lg-5 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <div className="stat-pill px-3 py-1 mb-3 d-inline-flex align-items-center gap-2">
              <i className="bi bi-sparkles" />
              <span>Executive Operations</span>
            </div>
            <h2 className="fw-semibold mb-2">Welcome back to your command center</h2>
            <p className="text-white-50 mb-0">Track people, priorities, and delivery across your resource allocation workspace.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light rounded-pill soft-btn"><i className="bi bi-plus-lg me-2" />New Project</button>
            <button className="btn btn-primary rounded-pill soft-btn"><i className="bi bi-graph-up me-2" />View Reports</button>
          </div>
        </div>
      </motion.div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <DashboardCard title="Employees" value={stats.employees} icon="bi-people" />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard title="Projects" value={stats.projects} icon="bi-briefcase" />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard title="Tasks" value={stats.tasks} icon="bi-check2-square" />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard title="Pending" value={stats.pending} icon="bi-hourglass-split" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="page-surface p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-semibold mb-1">Workspace Snapshot</h4>
            <p className="text-white-50 mb-0">A refined overview of the current operating rhythm.</p>
          </div>
          <span className="stat-pill px-3 py-2">Live</span>
        </div>
        <p className="text-white-50 mb-0">Manage employees, projects, and tasks efficiently through a centralized dashboard designed for modern teams.</p>
      </motion.div>
    </div>
  );
}
