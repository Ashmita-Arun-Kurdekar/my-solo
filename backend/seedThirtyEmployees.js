require("dotenv").config();
const bcrypt = require("bcrypt");
const { Client } = require("pg");

const employees = [
  "Aarav Patel", "Aditi Singh", "Akash Kumar", "Ananya Das", "Arjun Rao", "Bhavna Shah", "Chetan Joshi", "Deepika Roy", "Devansh Gupta", "Esha Kapoor",
  "Farhan Ali", "Gauri Jain", "Harish Nair", "Ishita Bose", "Jatin Mehta", "Kavya Iyer", "Lakshya Verma", "Meera Kulkarni", "Nikhil Soni", "Ojas Malhotra",
  "Pallavi Rane", "Raghav Bansal", "Sakshi Yadav", "Tanvi Desai", "Uday Mishra", "Vaishnavi Rao", "Yash Thakur", "Zoya Khan", "Naveen Reddy", "Ritika Sen",
];

async function seed() {
  const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  await client.connect();
  let created = 0; let skipped = 0;
  for (const fullName of employees) {
    const firstName = fullName.split(" ")[0].toLowerCase();
    const email = `${firstName}@gmail.com`;
    const password = `${firstName.slice(0, 4)}1234`;
    const exists = await client.query("SELECT employee_id FROM employees WHERE email = $1", [email]);
    if (exists.rows.length) { skipped += 1; continue; }
    await client.query(
      "INSERT INTO employees (full_name, email, password, phone, designation, role_id, department_id) VALUES ($1,$2,$3,$4,$5,3,2)",
      [fullName, email, await bcrypt.hash(password, 10), "", "Software Engineer"]
    );
    created += 1;
  }
  const total = await client.query("SELECT COUNT(*)::int AS count FROM employees WHERE role_id = 3");
  console.log(`Created ${created} employee accounts; skipped ${skipped} existing accounts; employee total is ${total.rows[0].count}.`);
  await client.end();
}

seed().catch((error) => { console.error(error.message); process.exit(1); });
