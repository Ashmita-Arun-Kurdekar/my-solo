/* Starts Express and the private FastAPI model service together. */
const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const python = process.env.PYTHON_COMMAND || (process.platform === "win32" ? "python" : "python3");
const ml = spawn(python, ["-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"], { cwd: path.join(root, "ai-service"), stdio: "inherit" });
const api = spawn(process.execPath, ["src/server.js"], { cwd: __dirname, stdio: "inherit" });
let closing = false;
const stop = (code = 0) => { if (closing) return; closing = true; if (!ml.killed) ml.kill(); if (!api.killed) api.kill(); setTimeout(() => process.exit(code), 250); };
ml.on("error", (error) => { console.error(`Could not start ML service: ${error.message}`); stop(1); });
api.on("error", (error) => { console.error(`Could not start Express: ${error.message}`); stop(1); });
ml.on("exit", (code) => { if (!closing) { console.error(`ML service stopped with code ${code}.`); stop(code || 1); } });
api.on("exit", (code) => { if (!closing) stop(code || 0); });
process.on("SIGINT", () => stop(0)); process.on("SIGTERM", () => stop(0));
