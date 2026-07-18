import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerLayout from "./components/ManagerLayout";
import { ManagerCalendar, ManagerNotifications, ManagerProfile, ManagerProjects, ManagerTasks, ManagerTeam } from "./pages/ManagerPages";
import AdminLayout from "./components/AdminLayout";
import { AdminDepartments, AdminPeople, AdminReports, AdminUtility, AdminWork } from "./pages/AdminPages";
import AdminProjects from "./pages/AdminProjects";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLayout from "./components/EmployeeLayout";
import EmployeeTasks from "./pages/EmployeeTasks";
import EmployeeProjects from "./pages/EmployeeProjects";
import { EmployeeCalendar, EmployeeNotifications, EmployeeProfile } from "./pages/EmployeeUtility";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute roles={[1]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<AdminPeople />} /><Route path="managers" element={<AdminPeople managers />} />
            <Route path="departments" element={<AdminDepartments />} /><Route path="projects" element={<AdminProjects />} /><Route path="tasks" element={<AdminWork type="tasks" />} />
            <Route path="reports" element={<AdminReports />} /><Route path="analytics" element={<AdminReports analytics />} /><Route path="notifications" element={<AdminUtility kind="notifications" />} /><Route path="profile" element={<AdminUtility kind="profile" />} /><Route path="settings" element={<AdminUtility kind="settings" />} />
          </Route>
          <Route path="/manager" element={<ProtectedRoute roles={[2]}><ManagerLayout /></ProtectedRoute>}>
            <Route index element={<ManagerDashboard />} />
            <Route path="projects" element={<ManagerProjects />} />
            <Route path="tasks" element={<ManagerTasks />} />
            <Route path="team" element={<ManagerTeam />} />
            <Route path="calendar" element={<ManagerCalendar />} />
            <Route path="notifications" element={<ManagerNotifications />} />
            <Route path="profile" element={<ManagerProfile />} />
          </Route>
          <Route path="/employee" element={<ProtectedRoute roles={[3]}><EmployeeLayout /></ProtectedRoute>}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="projects" element={<EmployeeProjects />} />
            <Route path="calendar" element={<EmployeeCalendar />} />
            <Route path="notifications" element={<EmployeeNotifications />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute roles={[1]}><Navigate to="/admin/employees" replace /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute roles={[2]}><Navigate to="/manager/team" replace /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute roles={[1]}><Navigate to="/admin/projects" replace /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute roles={[1]}><Navigate to="/admin/tasks" replace /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
