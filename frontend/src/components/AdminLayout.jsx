import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import PageTransition from "./PageTransition";
import { AnimatePresence } from "../lib/motionShim";
export default function AdminLayout(){const location=useLocation();return <div className="d-flex app-shell admin-shell"><AdminSidebar/><div className="flex-grow-1 min-vw-0"><AdminNavbar/><main className="container-fluid p-3 p-lg-4"><AnimatePresence mode="wait"><PageTransition key={location.pathname}><Outlet/></PageTransition></AnimatePresence></main></div></div>}
