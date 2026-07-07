import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="bg-dark text-white p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h3 className="mb-4">TaskFlow</h3>

      <ul className="nav flex-column">

        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/dashboard">
            Dashboard
          </Link>
        </li>

        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/employees">
            Employees
          </Link>
        </li>

        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/projects">
            Projects
          </Link>
        </li>

        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/tasks">
            Tasks
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;