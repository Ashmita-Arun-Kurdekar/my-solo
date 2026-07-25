require("dotenv").config();
const { Client } = require("pg");

const profiles = [
  ["aarav@gmail.com", "Frontend Developer", ["React", "JavaScript", "HTML", "CSS", "Tailwind"], 3], ["aditi@gmail.com", "Backend Developer", ["Node.js", "Express", "PostgreSQL", "REST API"], 4],
  ["akash@gmail.com", "Full Stack Developer", ["React", "Node.js", "Express", "PostgreSQL"], 3], ["ananya@gmail.com", "Data Analyst", ["SQL", "Excel", "Power BI", "Python"], 2],
  ["arjun@gmail.com", "DevOps Engineer", ["Docker", "Kubernetes", "AWS", "Linux"], 4], ["bhavna@gmail.com", "QA Engineer", ["Selenium", "Cypress", "Postman", "Testing"], 3],
  ["chetan@gmail.com", "UI/UX Designer", ["Figma", "UI", "UX", "Prototyping"], 3], ["deepika@gmail.com", "Mobile Developer", ["Flutter", "Dart", "Android", "iOS"], 3],
  ["devansh@gmail.com", "AI Engineer", ["Python", "Machine Learning", "OpenAI", "TensorFlow"], 4], ["esha@gmail.com", "Data Scientist", ["Python", "Pandas", "Statistics", "Scikit-learn"], 3],
  ["farhan@gmail.com", "Frontend Developer", ["React", "TypeScript", "CSS", "HTML"], 2], ["gauri@gmail.com", "Backend Developer", ["Java", "Spring", "SQL", "API"], 4],
  ["harish@gmail.com", "Full Stack Developer", ["React", "Node.js", "MongoDB", "Express"], 5], ["ishita@gmail.com", "Data Analyst", ["SQL", "Tableau", "Excel", "Analytics"], 2],
  ["jatin@gmail.com", "DevOps Engineer", ["AWS", "Terraform", "Jenkins", "Docker"], 3], ["kavya@gmail.com", "QA Engineer", ["Cypress", "Jest", "Automation", "QA"], 2],
  ["lakshya@gmail.com", "UI/UX Designer", ["Figma", "Wireframing", "Design System", "UX"], 3], ["meera@gmail.com", "Mobile Developer", ["React Native", "JavaScript", "Android", "iOS"], 2],
  ["nikhil@gmail.com", "AI Engineer", ["Python", "NLP", "LLM", "LangChain"], 4], ["ojas@gmail.com", "Data Scientist", ["Python", "Machine Learning", "Pandas", "TensorFlow"], 3],
  ["pallavi@gmail.com", "Frontend Developer", ["Angular", "TypeScript", "HTML", "CSS"], 3], ["raghav@gmail.com", "Backend Developer", ["Python", "Django", "PostgreSQL", "API"], 4],
  ["sakshi@gmail.com", "Full Stack Developer", ["React", "Node.js", "PostgreSQL", "TypeScript"], 3], ["tanvi@gmail.com", "Data Analyst", ["Power BI", "SQL", "Python", "Statistics"], 2],
  ["uday@gmail.com", "DevOps Engineer", ["Azure", "Kubernetes", "CI/CD", "Linux"], 4], ["vaishnavi@gmail.com", "QA Engineer", ["Selenium", "Postman", "Jest", "Testing"], 3],
  ["yash@gmail.com", "UI/UX Designer", ["Figma", "UI", "Prototyping", "Design System"], 2], ["zoya@gmail.com", "Mobile Developer", ["Kotlin", "Android", "Flutter", "Mobile"], 3],
  ["naveen@gmail.com", "AI Engineer", ["Python", "PyTorch", "Machine Learning", "NLP"], 5], ["ritika@gmail.com", "Data Scientist", ["Python", "Statistics", "Scikit-learn", "Pandas"], 4],
];

async function enrich() {
  const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await client.connect();
  for (const [email, designation, skills, experience] of profiles) {
    const employee = await client.query("UPDATE employees SET designation = $1 WHERE email = $2 RETURNING employee_id", [designation, email]);
    if (!employee.rows.length) continue;
    await client.query(`INSERT INTO employee_profiles (employee_id, skills, certifications, education, preferred_domain, previous_projects, experience_years, current_workload, availability_status)
      VALUES ($1,$2,ARRAY[]::text[],'B.Tech Computer Science',$3,ARRAY['Portfolio project'],$4,20,'Available')
      ON CONFLICT (employee_id) DO UPDATE SET skills = EXCLUDED.skills, preferred_domain = EXCLUDED.preferred_domain, experience_years = EXCLUDED.experience_years, current_workload = EXCLUDED.current_workload, availability_status = EXCLUDED.availability_status, updated_at = NOW()`, [employee.rows[0].employee_id, skills, designation, experience]);
  }
  const result = await client.query("SELECT designation, COUNT(*)::int AS count FROM employees WHERE email LIKE '%@gmail.com' GROUP BY designation ORDER BY designation");
  console.table(result.rows);
  await client.end();
}
enrich().catch((error) => { console.error(error.message); process.exit(1); });
