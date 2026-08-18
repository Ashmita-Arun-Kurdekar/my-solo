const allocationModel = require("../models/allocationModel");
const { predictRole, normalise } = require("../services/rolePredictionService");
const { recommendEmployees, getHealth } = require("../services/mlService");
const projects = require("../models/projectModel");

const predictionFor = async (employee) => {
  const prediction = predictRole(employee);
  await allocationModel.savePrediction({ employeeId: employee.employee_id, ...prediction });
  return { employeeId: employee.employee_id, employeeName: employee.full_name, ...prediction };
};

const predictAll = async (req, res) => {
  try {
    const employees = (await allocationModel.getEmployeeProfiles()).rows;
    const predictions = await Promise.all(employees.map(predictionFor));
    res.json({ success: true, predictions });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const predictOne = async (req, res) => {
  try {
    const employee = (await allocationModel.getEmployeeProfile(Number(req.params.id))).rows[0];
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });
    res.json({ success: true, prediction: await predictionFor(employee) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const autoAssign = async (req, res) => {
  try {
    const project = (await allocationModel.getProjectRequirements(Number(req.params.id))).rows[0];
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const requiredSkills = normalise(project.required_skills);
    const requiredRoles = normalise(project.required_roles);
    const employees = (await allocationModel.getEmployeeProfiles()).rows;
    const ranked = await Promise.all(employees.map(async (employee) => {
      const prediction = await predictionFor(employee);
      const skills = normalise(employee.skills);
      const matched = requiredSkills.filter((skill) => skills.some((own) => own.includes(skill)));
      const skillScore = requiredSkills.length ? matched.length / requiredSkills.length : 0.5;
      const roleMatch = !requiredRoles.length || requiredRoles.some((role) => prediction.predictedRole.toLowerCase().includes(role));
      const available = employee.availability_status === "Available";
      const experienceScore = Math.min(Number(employee.experience_years || 0), 10) / 10;
      const workloadScore = 1 - Math.min(Number(employee.current_workload || 0), 100) / 100;
      // Each weighted component is already expressed in points out of 100.
      // Do not multiply the total again: allocation_score is constrained to 0–100.
      const score = Math.max(0, Math.min(100, Math.round(
        skillScore * 40 +
        experienceScore * 30 +
        (available ? 1 : 0) * 20 +
        workloadScore * 10
      )));
      return { employee, prediction, matched, roleMatch, available, score };
    }));
    const size = Math.max(1, Number(project.maximum_team_size || 5));
    const selected = ranked.filter((item) => item.available && item.roleMatch && (item.matched.length || !requiredSkills.length)).sort((a, b) => b.score - a.score).slice(0, size);
    const rows = selected.map((item) => ({ employeeId: item.employee.employee_id, predictedRole: item.prediction.predictedRole, score: item.score, explanation: `${item.matched.length ? `${item.matched.length}/${requiredSkills.length} required skills matched` : "Role aligned"}; ${item.employee.experience_years || 0} years experience; available with ${item.employee.current_workload || 0}% workload.` }));
    await allocationModel.replaceAllocations(project.project_id, rows);
    res.json({ success: true, project: project.project_name, allocations: rows.map((row, index) => ({ ...row, employeeName: selected[index].employee.full_name })) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllocations = async (req, res) => { try { res.json({ success: true, allocations: (await allocationModel.getAllocations(req.query.projectId)).rows }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } };

const recommendForTask = async (req, res) => {
  try {
    const projectId = Number(req.body.project_id);
    if (!Number.isInteger(projectId)) return res.status(400).json({ success: false, message: "A valid project is required." });
    const project = (await projects.getProjectById(projectId)).rows[0];
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (Number(req.user.role_id) === 2 && Number(project.manager_id) !== Number(req.user.employee_id)) return res.status(403).json({ success: false, message: "You can only request recommendations for your projects." });
    const priority = ["Low", "Medium", "High"].includes(req.body.priority) ? req.body.priority : "Medium";
    const start = new Date(req.body.assigned_date); const due = new Date(req.body.due_date);
    const plannedDuration = Number.isFinite(due - start) && due >= start ? Math.max(1, Math.ceil((due - start) / 86400000)) : 1;
    const rows = (await allocationModel.getTaskRecommendationCandidates(projectId)).rows;
    const candidates = rows.filter((row) => row.availability_status !== "Unavailable").map((row) => ({
      ...row, employee_id: Number(row.employee_id), department_match: Number(row.department_match), experience_years: Number(row.experience_years), active_tasks: Number(row.active_tasks), completed_tasks: Number(row.completed_tasks), overdue_tasks: Number(row.overdue_tasks), completion_rate: Number(row.completion_rate), average_completion_days: Number(row.average_completion_days), similar_tasks_completed: Number(row.similar_tasks_completed), current_workload: Number(row.current_workload), task_priority: priority, planned_duration_days: plannedDuration,
    }));
    const result = await recommendEmployees(candidates, Math.min(5, candidates.length || 1));
    res.json({ success: true, task_title: req.body.task_title || "New task", ...result });
  } catch (error) {
    console.error("ML recommendation unavailable:", error.message);
    res.status(503).json({ success: false, code: "ML_UNAVAILABLE", message: "AI recommendations are temporarily unavailable. You can still assign the task manually." });
  }
};
const mlHealth = async (_req, res) => { try { const health = await getHealth(); res.json({ success: true, available: health.status === "ok", ...health }); } catch { res.json({ success: true, available: false, status: "offline", message: "Start the ML service with npm run start:full or python -m uvicorn app:app --port 8000." }); } };
module.exports = { predictOne, predictAll, autoAssign, getAllocations, recommendForTask, mlHealth };
