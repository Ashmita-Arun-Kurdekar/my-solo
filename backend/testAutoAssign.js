require("dotenv").config();
const http = require("http");
const jwt = require("jsonwebtoken");

const token = jwt.sign({ employee_id: 6, role_id: 2 }, process.env.JWT_SECRET, { expiresIn: "5m" });
const request = http.request({ hostname: "localhost", port: process.env.PORT || 5000, path: "/api/projects/1/auto-assign", method: "POST", headers: { Authorization: `Bearer ${token}` } }, (response) => {
  let body = ""; response.on("data", (chunk) => { body += chunk; }); response.on("end", () => { console.log(response.statusCode, body); });
});
request.on("error", (error) => { console.error(error.message); process.exit(1); });
request.end();
