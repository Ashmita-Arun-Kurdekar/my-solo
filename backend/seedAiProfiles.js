require("dotenv").config();
const { Client } = require("pg");

const profiles = [
  { id: 3, skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"], certifications: ["Meta Front-End Developer"], education: "B.Tech Computer Science", domain: "Web Development", projects: ["Customer portal", "Analytics dashboard"], experience: 3, workload: 25 },
  { id: 5, skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "OpenAI"], certifications: ["AWS Certified Machine Learning"], education: "M.Sc Data Science", domain: "Artificial Intelligence", projects: ["Demand forecasting", "Support chatbot"], experience: 4, workload: 35 },
];

async function seed() {
  const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await client.connect();
  for (const profile of profiles) {
    await client.query(
      `INSERT INTO employee_profiles (employee_id, skills, certifications, education, preferred_domain, previous_projects, experience_years, current_workload, availability_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Available')
       ON CONFLICT (employee_id) DO UPDATE SET skills = EXCLUDED.skills, certifications = EXCLUDED.certifications, education = EXCLUDED.education, preferred_domain = EXCLUDED.preferred_domain, previous_projects = EXCLUDED.previous_projects, experience_years = EXCLUDED.experience_years, current_workload = EXCLUDED.current_workload, availability_status = EXCLUDED.availability_status, updated_at = NOW()`,
      [profile.id, profile.skills, profile.certifications, profile.education, profile.domain, profile.projects, profile.experience, profile.workload]
    );
  }
  const result = await client.query("SELECT e.full_name, p.skills, p.experience_years, p.availability_status FROM employee_profiles p JOIN employees e ON e.employee_id = p.employee_id ORDER BY e.employee_id");
  console.table(result.rows);
  await client.end();
}

seed().catch((error) => { console.error(error.message); process.exit(1); });
