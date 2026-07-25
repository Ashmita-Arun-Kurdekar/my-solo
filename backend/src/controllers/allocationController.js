const allocationModel = require("../models/allocationModel");
const { predictRole, normalise } = require("../services/rolePredictionService");

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
      const score = Math.round((skillScore * 40 + experienceScore * 30 + (available ? 1 : 0) * 20 + workloadScore * 10) * 100);
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
module.exports = { predictOne, predictAll, autoAssign, getAllocations };
