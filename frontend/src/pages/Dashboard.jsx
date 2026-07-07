import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";

import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    tasks: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard statistics.");
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container mt-4">
          <div className="row">

            <div className="col-md-3 mb-4">
              <DashboardCard
                title="Employees"
                value={stats.employees}
              />
            </div>

            <div className="col-md-3 mb-4">
              <DashboardCard
                title="Projects"
                value={stats.projects}
              />
            </div>

            <div className="col-md-3 mb-4">
              <DashboardCard
                title="Tasks"
                value={stats.tasks}
              />
            </div>

            <div className="col-md-3 mb-4">
              <DashboardCard
                title="Pending"
                value={stats.pending}
              />
            </div>

          </div>

          <div className="card shadow p-4">
            <h3>Welcome to TaskFlow</h3>

            <p>
              Manage employees, projects, and tasks efficiently through a centralized dashboard.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;