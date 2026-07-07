const pool = require("../config/db");

const getAllDepartments = async () => {
  const query = `
    SELECT
      department_id,
      department_name
    FROM departments
    ORDER BY department_name;
  `;

  return await pool.query(query);
};

module.exports = {
  getAllDepartments,
};