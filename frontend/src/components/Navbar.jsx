function Navbar() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  return (
    <nav className="navbar navbar-light bg-light shadow-sm px-4">
      <h4>Company Work Allocation System</h4>

      <span>
        Welcome, {employee?.name}
      </span>
    </nav>
  );
}

export default Navbar;