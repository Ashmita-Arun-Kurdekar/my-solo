const http = require("http");
const https = require("https");

const postJson = (path, payload) => new Promise((resolve, reject) => {
  const base = new URL(process.env.ML_SERVICE_URL || "http://127.0.0.1:8000");
  const body = JSON.stringify(payload);
  const transport = base.protocol === "https:" ? https : http;
  const request = transport.request(new URL(path, base), {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body) },
    timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS || 4000),
  }, (response) => {
    let raw = "";
    response.on("data", (chunk) => { raw += chunk; });
    response.on("end", () => {
      let parsed;
      try { parsed = JSON.parse(raw); } catch { return reject(new Error("ML service returned invalid JSON.")); }
      if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(parsed.detail || "ML service request failed."));
      resolve(parsed);
    });
  });
  request.on("timeout", () => request.destroy(new Error("ML service timed out.")));
  request.on("error", reject);
  request.end(body);
});

const recommendEmployees = (candidates, limit = 5) => postJson("/recommend-employees", { candidates, limit });
const getHealth = () => new Promise((resolve, reject) => {
  const base = new URL(process.env.ML_SERVICE_URL || "http://127.0.0.1:8000");
  const transport = base.protocol === "https:" ? https : http;
  const request = transport.get(new URL("/health", base), { timeout: 2000 }, (response) => {
    let raw = ""; response.on("data", (chunk) => { raw += chunk; }); response.on("end", () => { try { const parsed = JSON.parse(raw); if (response.statusCode !== 200) return reject(new Error("ML health check failed.")); resolve(parsed); } catch { reject(new Error("ML service returned invalid health data.")); } });
  });
  request.on("timeout", () => request.destroy(new Error("ML health check timed out."))); request.on("error", reject);
});
module.exports = { recommendEmployees, getHealth };
