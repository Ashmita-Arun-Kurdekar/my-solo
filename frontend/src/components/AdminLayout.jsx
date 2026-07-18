import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
export default function AdminLayout(){return <div className="d-flex app-shell admin-shell"><AdminSidebar/><div className="flex-grow-1 min-vw-0"><AdminNavbar/><main className="container-fluid p-3 p-lg-4"><Outlet/></main></div></div>}
