import DashboardContent from "../components/DashboardContent";
import SidebarEmployee from "../components/SidebarEmployee";
import Navbar from "../components/Navbar";

function EmployeeDashboard() {
  return (
    <div className="d-flex app-shell">
      <SidebarEmployee />
      <div className="flex-grow-1">
        <Navbar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default EmployeeDashboard;
