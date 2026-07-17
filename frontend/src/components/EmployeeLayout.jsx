import { Outlet } from "react-router-dom";
import EmployeeNavbar from "./EmployeeNavbar";
import SidebarEmployee from "./SidebarEmployee";

export default function EmployeeLayout() {
  return <div className="d-flex app-shell"><SidebarEmployee /><div className="flex-grow-1 min-vw-0"><EmployeeNavbar /><Outlet /></div></div>;
}
