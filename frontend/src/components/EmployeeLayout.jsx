import { Outlet, useLocation } from "react-router-dom";
import EmployeeNavbar from "./EmployeeNavbar";
import SidebarEmployee from "./SidebarEmployee";
import PageTransition from "./PageTransition";
import { AnimatePresence } from "../lib/motionShim";

export default function EmployeeLayout() {
  const location = useLocation();
  return <div className="d-flex app-shell employee-shell"><SidebarEmployee /><div className="flex-grow-1 min-vw-0"><EmployeeNavbar /><AnimatePresence mode="wait"><PageTransition key={location.pathname}><Outlet /></PageTransition></AnimatePresence></div></div>;
}
