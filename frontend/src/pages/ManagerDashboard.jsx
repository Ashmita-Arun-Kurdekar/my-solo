import DashboardContent from "../components/DashboardContent";
import SidebarManager from "../components/SidebarManager";
import Navbar from "../components/Navbar";

function ManagerDashboard() {
  return (
    <div className="d-flex app-shell">
      <SidebarManager />
      <div className="flex-grow-1">
        <Navbar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default ManagerDashboard;
