require("dotenv").config();
const { Client } = require("pg");

const projects = [
  ["Customer Portal", "React customer account and service portal.", ["React", "JavaScript", "HTML", "CSS"], ["Frontend Developer", "Backend Developer"], "High", 4, "2026-08-01", "2026-10-30"],
  ["Insights Dashboard", "Business intelligence reporting dashboard.", ["SQL", "Power BI", "Python"], ["Data Analyst"], "Medium", 3, "2026-08-05", "2026-09-30"],
  ["AI Support Assistant", "LLM-powered internal support assistant.", ["Python", "NLP", "OpenAI", "Machine Learning"], ["AI Engineer", "Backend Developer"], "Critical", 4, "2026-08-10", "2026-11-15"],
  ["Cloud Release Platform", "Automated cloud deployment platform.", ["Docker", "Kubernetes", "AWS", "CI/CD"], ["DevOps Engineer", "Backend Developer"], "High", 3, "2026-08-01", "2026-10-15"],
  ["Mobile Commerce App", "Cross-platform shopping application.", ["Flutter", "Android", "iOS"], ["Mobile Developer", "UI/UX Designer"], "High", 4, "2026-08-12", "2026-12-01"],
  ["Quality Automation", "Regression test automation suite.", ["Selenium", "Cypress", "Postman", "Testing"], ["QA Engineer"], "Medium", 3, "2026-08-03", "2026-09-20"],
  ["Design System", "Reusable accessible product design system.", ["Figma", "UI", "UX", "Design System"], ["UI/UX Designer", "Frontend Developer"], "Medium", 3, "2026-08-15", "2026-10-01"],
  ["Demand Forecasting", "Sales forecast model and reporting pipeline.", ["Python", "Pandas", "Statistics", "Machine Learning"], ["Data Scientist", "Data Analyst"], "High", 4, "2026-08-08", "2026-11-01"],
  ["Workflow Hub", "Internal workflow management web application.", ["React", "Node.js", "Express", "PostgreSQL"], ["Full Stack Developer", "QA Engineer"], "High", 5, "2026-08-01", "2026-12-15"],
  ["API Modernization", "Modernize and document service APIs.", ["Node.js", "Express", "PostgreSQL", "API"], ["Backend Developer", "DevOps Engineer"], "Medium", 3, "2026-08-20", "2026-10-31"],
];

async function seed() {
  const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await client.connect(); await client.query("BEGIN");
  try { await client.query("DELETE FROM allocations"); await client.query("DELETE FROM tasks"); await client.query("DELETE FROM projects"); for (const [name, description, skills, roles, priority, size, start, end] of projects) await client.query("INSERT INTO projects (project_name,description,manager_id,department_id,start_date,end_date,status,required_skills,required_roles,priority,maximum_team_size) VALUES ($1,$2,2,2,$3,$4,'Active',$5,$6,$7,$8)", [name, description, start, end, skills, roles, priority, size]); await client.query("COMMIT"); console.log(`Replaced existing data with ${projects.length} AI test projects.`); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { await client.end(); }
}
seed().catch((error) => { console.error(error.message); process.exit(1); });
