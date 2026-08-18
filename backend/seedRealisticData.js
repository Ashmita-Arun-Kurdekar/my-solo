/* eslint-disable no-console */
// Idempotent medium-company dataset. Never drops tables or deletes application data.
require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
const BASE_DATE = new Date("2026-08-18T12:00:00Z");
const day = (offset) => new Date(BASE_DATE.getTime() + offset * 86400000).toISOString().slice(0, 10);
const timestamp = (hoursAgo) => new Date(BASE_DATE.getTime() - hoursAgo * 3600000).toISOString();
const managerPassword = (name) => { const first = name.split(" ")[0].toLowerCase(); return `${first}man123${first[0]}`; };
const employeePassword = (name) => `${name.split(" ")[0].toLowerCase().slice(0, 4)}1234`;

const DEPARTMENTS = ["Human Resources", "Information Technology", "Finance", "Marketing", "Operations", "Product Development"];
const MANAGERS = [
  ["Rahul Sharma", "rahulman@gmail.com", "Operations Manager", "Operations"],
  ["Priya Nair", "priyaman@gmail.com", "HR Manager", "Human Resources"],
  ["Amit Verma", "amitman@gmail.com", "Engineering Manager", "Information Technology"],
  ["Sneha Reddy", "snehaman@gmail.com", "Finance Manager", "Finance"],
  ["Karan Mehta", "karanman@gmail.com", "Marketing Manager", "Marketing"],
  ["Ashmita Kurdekar", "ashmitaman@gmail.com", "Product Manager", "Product Development"],
];
const EXISTING_EMPLOYEES = [
  ["Ram", "ram@gmail.com"], ["Ankita Arun Kurdekar", "ankita@gmail.com"], ["Aarav Patel", "aarav@gmail.com"],
  ["Aditi Singh", "aditi@gmail.com"], ["Akash Kumar", "akash@gmail.com"], ["Ananya Das", "ananya@gmail.com"],
  ["Arjun Rao", "arjun@gmail.com"], ["Bhavna Shah", "bhavna@gmail.com"], ["Chetan Joshi", "chetan@gmail.com"],
  ["Deepika Roy", "deepika@gmail.com"], ["Devansh Gupta", "devansh@gmail.com"], ["Esha Kapoor", "esha@gmail.com"],
  ["Farhan Ali", "farhan@gmail.com"], ["Gauri Jain", "gauri@gmail.com"], ["Harish Nair", "harish@gmail.com"],
  ["Ishita Bose", "ishita@gmail.com"], ["Jatin Mehta", "jatin@gmail.com"], ["Kavya Iyer", "kavya@gmail.com"],
  ["Lakshya Verma", "lakshya@gmail.com"], ["Meera Kulkarni", "meera@gmail.com"], ["Nikhil Soni", "nikhil@gmail.com"],
  ["Ojas Malhotra", "ojas@gmail.com"], ["Pallavi Rane", "pallavi@gmail.com"], ["Raghav Bansal", "raghav@gmail.com"],
  ["Sakshi Yadav", "sakshi@gmail.com"], ["Tanvi Desai", "tanvi@gmail.com"], ["Uday Mishra", "uday@gmail.com"],
  ["Vaishnavi Rao", "vaishnavi@gmail.com"], ["Yash Thakur", "yash@gmail.com"], ["Zoya Khan", "zoya@gmail.com"],
  ["Naveen Reddy", "naveen@gmail.com"], ["Ritika Sen", "ritika@gmail.com"],
];
const NEW_EMPLOYEES = [
  ["Neha Joshi", "neha.joshi@technova.com"], ["Rohan Kulkarni", "rohan.kulkarni@technova.com"],
  ["Vikram Singh", "vikram.singh@technova.com"], ["Aditya Nair", "aditya.nair@technova.com"],
  ["Riya Kulkarni", "riya.kulkarni@technova.com"], ["Pooja Nair", "pooja.nair@technova.com"],
  ["Varun Mehta", "varun.mehta@technova.com"], ["Divya Reddy", "divya.reddy@technova.com"],
];
const ALL_EMPLOYEES = [...EXISTING_EMPLOYEES, ...NEW_EMPLOYEES];
const DESIGNATIONS = {
  "Human Resources": ["HR Executive", "Recruiter", "HR Analyst"],
  "Information Technology": ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "QA Engineer", "DevOps Engineer", "Data Analyst"],
  Finance: ["Financial Analyst", "Accountant", "Finance Executive"],
  Marketing: ["Marketing Executive", "SEO Analyst", "Content Strategist"],
  Operations: ["Operations Analyst", "Process Coordinator", "Support Specialist"],
  "Product Development": ["Product Analyst", "UI/UX Designer", "Business Analyst", "QA Engineer"],
};
const PROJECTS = [
  ["Employee Management Portal", "Information Technology"], ["Customer CRM Platform", "Marketing"],
  ["Inventory Management System", "Operations"], ["Banking Analytics Dashboard", "Finance"],
  ["E-Commerce Platform", "Product Development"], ["HR Automation System", "Human Resources"],
  ["Sales Analytics Platform", "Marketing"], ["Customer Support Platform", "Operations"],
  ["Financial Reporting System", "Finance"], ["Recruitment Management System", "Human Resources"],
  ["Project Management Portal", "Information Technology"], ["Healthcare Appointment System", "Product Development"],
  ["Internal Communication Portal", "Information Technology"], ["Resource Planning Platform", "Operations"],
  ["Product Insights Hub", "Product Development"],
];
const TASK_TITLES = ["Design authentication flow", "Build employee dashboard", "Implement JWT authentication", "Create PostgreSQL schema", "Develop REST API", "Build notification service", "Create Power BI data model", "Design project management UI", "Test login workflow", "Implement employee search", "Fix dashboard responsiveness", "Create analytics report", "Implement task assignment", "Develop project API", "Perform integration testing", "Create database indexes", "Build manager dashboard", "Implement role-based access", "Test notification workflow", "Prepare deployment pipeline"];
const UPDATE_TEXTS = ["Started API development.", "Completed database integration.", "Testing authentication flow.", "UI implementation is in progress.", "Fixed validation issue.", "Waiting for design approval.", "Completed testing.", "Deployed changes to staging.", "Updated database queries.", "Working on responsive layout."];

async function ensureReferenceData(client) {
  for (const [id, name] of [[1, "Admin"], [2, "Manager"], [3, "Employee"]]) await client.query("INSERT INTO roles(role_id,role_name) VALUES($1,$2) ON CONFLICT DO NOTHING", [id, name]);
  for (const name of DEPARTMENTS) await client.query("INSERT INTO departments(department_name) VALUES($1) ON CONFLICT (department_name) DO NOTHING", [name]);
  const rows = (await client.query("SELECT department_id,department_name FROM departments WHERE department_name=ANY($1)", [DEPARTMENTS])).rows;
  return Object.fromEntries(rows.map((row) => [row.department_name, row.department_id]));
}

async function upsertPeople(client, departments, created) {
  for (let i = 0; i < MANAGERS.length; i++) {
    const [name, email, designation, department] = MANAGERS[i]; const hash = await bcrypt.hash(managerPassword(name), 10);
    const existing = await client.query("SELECT employee_id FROM employees WHERE lower(email)=lower($1)", [email]);
    if (existing.rows.length) await client.query("UPDATE employees SET password=$1,role_id=2 WHERE employee_id=$2", [hash, existing.rows[0].employee_id]);
    else { await client.query("INSERT INTO employees(full_name,email,password,phone,designation,role_id,department_id,created_at) VALUES($1,$2,$3,$4,$5,2,$6,$7)", [name, email, hash, `+91-90000${String(10000 + i).slice(-5)}`, designation, departments[department], timestamp(9000 - i * 100)]); created.managers++; }
  }
  for (let i = 0; i < ALL_EMPLOYEES.length; i++) {
    const [name, email] = ALL_EMPLOYEES[i]; const department = DEPARTMENTS[i % DEPARTMENTS.length]; const roles = DESIGNATIONS[department]; const designation = roles[i % roles.length]; const hash = await bcrypt.hash(employeePassword(name), 10);
    const existing = await client.query("SELECT employee_id FROM employees WHERE lower(email)=lower($1)", [email]);
    if (existing.rows.length) await client.query("UPDATE employees SET password=$1,role_id=3,department_id=COALESCE(department_id,$2),designation=COALESCE(designation,$3) WHERE employee_id=$4", [hash, departments[department], designation, existing.rows[0].employee_id]);
    else { await client.query("INSERT INTO employees(full_name,email,password,phone,designation,role_id,department_id,created_at) VALUES($1,$2,$3,$4,$5,3,$6,$7)", [name, email, hash, `+91-91000${String(10000 + i).slice(-5)}`, designation, departments[department], timestamp(7000 - i * 60)]); created.employees++; }
  }
}

async function seedProjects(client, departments, created) {
  const managers = (await client.query("SELECT employee_id,department_id FROM employees WHERE role_id=2 ORDER BY employee_id LIMIT 6")).rows;
  const currentCount = Number((await client.query("SELECT COUNT(*) AS count FROM projects")).rows[0].count);
  const projectsNeeded = Math.max(0, 15 - currentCount);
  for (let i = 0; i < projectsNeeded; i++) {
    const [name, department] = PROJECTS[i]; const exists = await client.query("SELECT project_id FROM projects WHERE project_name=$1", [name]);
    if (!exists.rows.length) { await client.query(`INSERT INTO projects(project_name,description,start_date,end_date,status,manager_id,department_id,required_skills,required_roles,priority,maximum_team_size,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,10,$11)`, [name, `${name} delivers measurable workflow, reporting, and customer experience improvements.`, day(-420 + i * 23), day(-420 + i * 23 + 240), i < 4 ? "Completed" : "Active", managers[i % managers.length].employee_id, departments[department], department === "Information Technology" ? ["javascript", "postgresql", "react"] : ["analysis", "reporting"], ["analyst", "developer"], i % 5 === 0 ? "High" : "Medium", timestamp(8000 - i * 200)]); created.projects++; }
  }
  return (await client.query("SELECT project_id,project_name,manager_id,department_id FROM projects WHERE manager_id IS NOT NULL AND department_id IS NOT NULL ORDER BY project_id LIMIT 15")).rows;
}

async function seedMemberships(client, projects, created) {
  const employees = (await client.query("SELECT employee_id,department_id FROM employees WHERE role_id=3 ORDER BY employee_id")).rows;
  const memberships = [];
  for (let p = 0; p < projects.length; p++) {
    const preferred = employees.filter((e) => e.department_id === projects[p].department_id);
    const poolForProject = [...preferred, ...employees.filter((e) => e.department_id !== projects[p].department_id)];
    for (let j = 0; j < 8; j++) {
      const employee = poolForProject[(p * 3 + j) % poolForProject.length];
      const result = await client.query("INSERT INTO project_members(project_id,employee_id,assigned_by,role_in_project,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(project_id,employee_id) DO NOTHING RETURNING id", [projects[p].project_id, employee.employee_id, projects[p].manager_id, j === 0 ? "lead" : "member", timestamp(5000 - p * 100 - j)]);
      if (result.rowCount) created.memberships++;
      memberships.push({ projectId: projects[p].project_id, managerId: projects[p].manager_id, employeeId: employee.employee_id });
    }
  }
  // Repair legacy assignments that predate the membership rule without changing the tasks.
  const repaired = await client.query(`INSERT INTO project_members(project_id,employee_id,assigned_by,role_in_project)
    SELECT DISTINCT t.project_id,t.assigned_to,t.assigned_by,'member' FROM tasks t
    WHERE t.project_id IS NOT NULL AND t.assigned_to IS NOT NULL
    ON CONFLICT(project_id,employee_id) DO NOTHING RETURNING id`);
  created.memberships += repaired.rowCount;
  return memberships;
}

async function seedTasks(client, projects, memberships, created) {
  const taskRows = [];
  for (let i = 0; i < 250; i++) {
    const project = projects[i % projects.length]; const members = memberships.filter((m) => m.projectId === project.project_id); const member = members[Math.floor(i / projects.length) % members.length];
    const marker = `[DEMO-${String(i + 1).padStart(3, "0")}]`; const taskTitle = `${TASK_TITLES[i % TASK_TITLES.length]} ${marker}`;
    const statusIndex = i % 20; const status = statusIndex < 9 ? "Completed" : statusIndex < 14 ? "In Progress" : "Pending";
    const duration = 7 + ((i * 11) % 55);
    const assignedOffset = status === "Completed" ? -500 + ((i * 17) % 430) : status === "In Progress" ? -45 + (i % 35) : -12 + (i % 12);
    const dueOffset = status === "Completed" ? assignedOffset + duration : status === "In Progress" ? (i % 5 === 0 ? -1 - (i % 20) : 3 + (i % 40)) : (i % 6 === 0 ? -1 - (i % 10) : 5 + (i % 50));
    const completedOffset = status === "Completed" ? dueOffset + (i % 7 === 0 ? 4 : -(1 + i % 6)) : null;
    const existing = await client.query("SELECT task_id FROM tasks WHERE task_title=$1", [taskTitle]);
    let taskId;
    if (existing.rows.length) { taskId = existing.rows[0].task_id; await client.query("UPDATE tasks SET project_id=$1,assigned_to=$2,assigned_by=$3,employee_id=$2,title=CAST($4::text AS varchar),description=$5,priority=$6,status=$7,assigned_date=$8,due_date=$9,completed_date=$10 WHERE task_id=$11", [project.project_id, member.employeeId, project.manager_id, taskTitle, "Demo delivery work item with acceptance criteria, review, testing, and measurable completion outcomes.", i % 10 < 3 ? "High" : i % 10 < 8 ? "Medium" : "Low", status, day(assignedOffset), day(dueOffset), completedOffset === null ? null : day(completedOffset), taskId]); }
    else { const result = await client.query(`INSERT INTO tasks(project_id,assigned_to,assigned_by,task_title,title,employee_id,description,priority,status,assigned_date,due_date,completed_date,created_at) VALUES($1,$2,$3,$4::text,CAST($4::text AS varchar),$2,$5,$6,$7,$8,$9,$10,$11) RETURNING task_id`, [project.project_id, member.employeeId, project.manager_id, taskTitle, "Demo delivery work item with acceptance criteria, review, testing, and measurable completion outcomes.", i % 10 < 3 ? "High" : i % 10 < 8 ? "Medium" : "Low", status, day(assignedOffset), day(dueOffset), completedOffset === null ? null : day(completedOffset), timestamp((520 - (i % 490)) * 24)]); taskId = result.rows[0].task_id; created.tasks++; }
    taskRows.push({ taskId, employeeId: member.employeeId, status, index: i });
  }
  return taskRows;
}

async function seedUpdatesAndNotifications(client, tasks, created) {
  for (let i = 0; i < 350; i++) {
    const task = tasks[i % tasks.length]; const marker = `[DEMO-UPDATE-${String(i + 1).padStart(3, "0")}]`; const text = `${UPDATE_TEXTS[i % UPDATE_TEXTS.length]} ${marker}`;
    const exists = await client.query("SELECT 1 FROM task_updates WHERE update_text=$1", [text]);
    if (!exists.rows.length) { await client.query("INSERT INTO task_updates(task_id,employee_id,update_text,status,created_at) VALUES($1,$2,$3,$4,$5)", [task.taskId, task.employeeId, text, task.status, timestamp(4000 - i * 7)]); created.updates++; }
  }
  const notificationTypes = [["New task assigned", "A new project task has been assigned.", "task_assigned"], ["Deadline approaching", "A task deadline is approaching; review the delivery plan.", "deadline"], ["Task completed", "A project task was completed and is ready for review.", "task_completed"], ["Project updated", "Project scope or delivery dates were updated.", "project_updated"], ["Added to project", "You were added to a project team.", "project_member"]];
  for (let i = 0; i < 120; i++) {
    const task = tasks[(i * 7) % tasks.length]; const [title, message, type] = notificationTypes[i % notificationTypes.length]; const marker = `[DEMO-NOTIFICATION-${String(i + 1).padStart(3, "0")}]`;
    const exists = await client.query("SELECT 1 FROM notifications WHERE message=$1", [`${message} ${marker}`]);
    if (!exists.rows.length) { await client.query("INSERT INTO notifications(employee_id,title,message,notification_type,is_read,created_at) VALUES($1,$2,$3,$4,$5,$6)", [task.employeeId, title, `${message} ${marker}`, type, i % 3 === 0, timestamp(2500 - i * 9)]); created.notifications++; }
  }
}

async function seedMlProfiles(client) {
  const employees = (await client.query("SELECT employee_id,department_id FROM employees WHERE role_id=3 ORDER BY employee_id")).rows;
  const skillsByDepartment = {
    "Human Resources": ["recruitment", "onboarding", "hr analytics"], "Information Technology": ["javascript", "react", "node.js", "postgresql"],
    Finance: ["financial analysis", "excel", "reporting"], Marketing: ["campaign analytics", "seo", "content"],
    Operations: ["process improvement", "planning", "support"], "Product Development": ["product analysis", "ux", "agile"],
  };
  const departments = Object.fromEntries((await client.query("SELECT department_id,department_name FROM departments")).rows.map((row) => [row.department_id, row.department_name]));
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i]; const department = departments[employee.department_id] || "Operations";
    await client.query(`INSERT INTO employee_profiles(employee_id,skills,certifications,education,preferred_domain,previous_projects,experience_years,current_workload,availability_status,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT(employee_id) DO UPDATE SET skills=EXCLUDED.skills,experience_years=EXCLUDED.experience_years,current_workload=EXCLUDED.current_workload,availability_status=EXCLUDED.availability_status,updated_at=EXCLUDED.updated_at`,
      [employee.employee_id, skillsByDepartment[department] || ["analysis"], i % 4 === 0 ? ["Agile Foundation"] : [], i % 3 === 0 ? "Bachelor of Technology" : "Bachelor's Degree", department, [], 1 + (i * 7 % 10), 15 + (i * 17 % 76), i % 13 === 0 ? "Busy" : "Available", timestamp(50 - i)]);
  }
}

async function verify(client) {
  const checks = (await client.query(`SELECT
    (SELECT COUNT(*)::int FROM employees WHERE role_id=1) admins,
    (SELECT COUNT(*)::int FROM employees WHERE role_id=2) managers,
    (SELECT COUNT(*)::int FROM employees WHERE role_id=3) employees,
    (SELECT COUNT(*)::int FROM projects) projects,
    (SELECT COUNT(*)::int FROM project_members) memberships,
    (SELECT COUNT(*)::int FROM tasks) tasks,
    (SELECT COUNT(*)::int FROM task_updates) updates,
    (SELECT COUNT(*)::int FROM notifications) notifications,
    (SELECT COUNT(*)::int FROM (SELECT lower(email) FROM employees GROUP BY lower(email) HAVING COUNT(*)>1) duplicate_groups) duplicate_emails,
    (SELECT COUNT(*)::int FROM tasks t LEFT JOIN projects p ON p.project_id=t.project_id WHERE p.project_id IS NULL) orphan_tasks,
    (SELECT COUNT(*)::int FROM project_members pm LEFT JOIN projects p ON p.project_id=pm.project_id LEFT JOIN employees e ON e.employee_id=pm.employee_id WHERE p.project_id IS NULL OR e.employee_id IS NULL) orphan_memberships,
    (SELECT COUNT(*)::int FROM tasks t WHERE NOT EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=t.project_id AND pm.employee_id=t.assigned_to)) tasks_without_membership,
    (SELECT COUNT(*)::int FROM employees WHERE left(password,3) NOT IN ('$2a','$2b','$2y')) non_bcrypt_passwords`)).rows[0];
  if (checks.duplicate_emails || checks.orphan_tasks || checks.orphan_memberships || checks.tasks_without_membership || checks.non_bcrypt_passwords) throw new Error(`Integrity verification failed: ${JSON.stringify(checks)}`);
  return checks;
}

async function main() {
  const client = await pool.connect(); const created = { managers: 0, employees: 0, projects: 0, memberships: 0, tasks: 0, updates: 0, notifications: 0 };
  try {
    await client.query("BEGIN"); const departments = await ensureReferenceData(client); await upsertPeople(client, departments, created);
    const projects = await seedProjects(client, departments, created); const memberships = await seedMemberships(client, projects, created); const tasks = await seedTasks(client, projects, memberships, created); await seedUpdatesAndNotifications(client, tasks, created); await seedMlProfiles(client);
    const checks = await verify(client); await client.query("COMMIT");
    console.log("\n=================================\nREALISTIC DATA SEED COMPLETE\n================================="); console.table(created); console.log("Final database totals:"); console.table(checks);
    console.log("\nAdmin account preserved (not modified).\nDemo credentials are documented locally in database/DEMO_ACCOUNTS.md.\n=================================");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); await pool.end(); }
}

main().catch((error) => { console.error("Seed failed; transaction rolled back:", error); process.exitCode = 1; });
