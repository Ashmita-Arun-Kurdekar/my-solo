import DashboardContent from "../components/DashboardContent";
import SidebarAdmin from "../components/SidebarAdmin";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  return (
    <div className="d-flex app-shell">
      <SidebarAdmin />
      <div className="flex-grow-1">
        <Navbar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default AdminDashboard;
