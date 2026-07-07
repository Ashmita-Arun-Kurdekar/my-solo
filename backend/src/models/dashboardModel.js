const pool = require("../config/db");

const getDashboardStats = async () => {

    const employeeQuery = "SELECT COUNT(*) FROM employees";
    const projectQuery = "SELECT COUNT(*) FROM projects";
    const taskQuery = "SELECT COUNT(*) FROM tasks";
    const pendingTaskQuery =
        "SELECT COUNT(*) FROM tasks WHERE status='Pending'";

    const employees = await pool.query(employeeQuery);
    const projects = await pool.query(projectQuery);
    const tasks = await pool.query(taskQuery);
    const pending = await pool.query(pendingTaskQuery);

    return {
        employees: employees.rows[0].count,
        projects: projects.rows[0].count,
        tasks: tasks.rows[0].count,
        pending: pending.rows[0].count
    };
};

module.exports = {
    getDashboardStats
};