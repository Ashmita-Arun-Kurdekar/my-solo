require("dotenv").config();
const { Client } = require("pg");

async function reassign() {
  const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await client.connect();
  const managers = (await client.query("SELECT employee_id FROM employees WHERE role_id = 2 AND employee_id <> 2 ORDER BY employee_id")).rows.map((row) => row.employee_id);
  const projects = (await client.query("SELECT project_id FROM projects ORDER BY project_id")).rows;
  for (let index = 0; index < projects.length; index += 1) await client.query("UPDATE projects SET manager_id = $1 WHERE project_id = $2", [managers[index % managers.length], projects[index].project_id]);
  const result = await client.query("SELECT p.project_name, e.full_name AS manager FROM projects p JOIN employees e ON e.employee_id = p.manager_id ORDER BY p.project_id");
  console.table(result.rows);
  await client.end();
}
reassign().catch((error) => { console.error(error.message); process.exit(1); });
