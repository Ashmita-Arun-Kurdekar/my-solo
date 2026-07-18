import { Outlet } from "react-router-dom";
import ManagerNavbar from "./ManagerNavbar";
import ManagerSidebar from "./ManagerSidebar";

export default function ManagerLayout() {
  return <div className="d-flex app-shell manager-shell"><ManagerSidebar /><div className="flex-grow-1 min-vw-0"><ManagerNavbar /><main className="container-fluid p-3 p-lg-4"><Outlet /></main></div></div>;
}
