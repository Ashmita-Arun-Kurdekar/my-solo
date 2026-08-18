import { Outlet, useLocation } from "react-router-dom";
import ManagerNavbar from "./ManagerNavbar";
import ManagerSidebar from "./ManagerSidebar";
import PageTransition from "./PageTransition";
import { AnimatePresence } from "../lib/motionShim";

export default function ManagerLayout() {
  const location = useLocation();
  return <div className="d-flex app-shell manager-shell"><ManagerSidebar /><div className="flex-grow-1 min-vw-0"><ManagerNavbar /><main className="container-fluid p-3 p-lg-4"><AnimatePresence mode="wait"><PageTransition key={location.pathname}><Outlet /></PageTransition></AnimatePresence></main></div></div>;
}
