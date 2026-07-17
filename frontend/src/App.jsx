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
          <Route path="/admin" element={<ProtectedRoute roles={[1]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={[2]}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute roles={[3]}><EmployeeLayout /></ProtectedRoute>}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="projects" element={<EmployeeProjects />} />
            <Route path="calendar" element={<EmployeeCalendar />} />
            <Route path="notifications" element={<EmployeeNotifications />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute roles={[1]}><Employees /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute roles={[2]}><Employees readOnly /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute roles={[1, 2]}><Projects /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute roles={[1, 2]}><Tasks /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
