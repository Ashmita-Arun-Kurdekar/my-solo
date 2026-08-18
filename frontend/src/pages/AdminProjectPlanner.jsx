import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getEmployees } from "../services/employeeService";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getAvailableEmployees,
  getDepartments,
  getManagers,
  getProjectMembers,
  getProjects,
  removeProjectMember,
  suggestBestEmployee,
  updateProject,
} from "../services/projectService";

const blank = { project_name: "", description: "", manager_id: "", department_id: "", start_date: "", end_date: "", status: "Active", required_skills: "", required_roles: "", priority: "Medium", maximum_team_size: 5, member_ids: [] };
const asText = (value) => Array.isArray(value) ? value.join(", ") : value || "";

const healthTone = (project) => {
  const totalTasks = Number(project.task_count || 0);
  const completedTasks = Number(project.completed_task_count || 0);
  const overdueTasks = Number(project.overdue_task_count || 0);
  const completion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  if (project.status === "Completed") return { label: "Complete", tone: "success", completion: 100 };
  if (overdueTasks > 0) return { label: "At risk", tone: "danger", completion };
  if (completion >= 80) return { label: "Healthy", tone: "success", completion };
  return { label: "Watch", tone: "warning", completion };
};

export default function AdminProjectPlanner() {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(null);
  const [teamProject, setTeamProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableTeam, setAvailableTeam] = useState([]);
  const [suggestedMember, setSuggestedMember] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [originalMemberIds, setOriginalMemberIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const projectData = await getProjects();
      setProjects(projectData.projects || []);
    } catch (error) {
      setProjects([]);
      setLoadError(error.response?.data?.message || "The project service could not be reached. Check the backend and database, then retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadProjectSetup = async () => {
    const [managerResult, departmentResult, employeeResult] = await Promise.allSettled([
      getManagers(),
      getDepartments(),
      getEmployees(),
    ]);

    const managerData = managerResult.status === "fulfilled" ? managerResult.value : { managers: [] };
    const departmentData = departmentResult.status === "fulfilled" ? departmentResult.value : { departments: [] };
    const employeeData = employeeResult.status === "fulfilled" ? employeeResult.value : { employees: [] };

    setManagers(managerData.managers || []);
    setDepartments(departmentData.departments || []);
    setEmployees((employeeData.employees || []).filter((employee) => Number(employee.role_id) === 3));

    if (managerResult.status === "rejected" || departmentResult.status === "rejected" || employeeResult.status === "rejected") {
      throw new Error("Project setup data is unavailable.");
    }

    return { managers: managerData.managers || [], departments: departmentData.departments || [] };
  };

  const loadTeam = async (project) => {
    setTeamProject(project);
    setSelectedTeamMembers([]);
    try {
      const [memberData, availableData, suggestionData] = await Promise.all([
        getProjectMembers(project.project_id),
        getAvailableEmployees(project.project_id),
        suggestBestEmployee(project.project_id),
      ]);
      setTeamMembers(memberData.members || []);
      setAvailableTeam(availableData.employees || []);
      setSuggestedMember(suggestionData.employee || null);
    } catch {
      toast.error("Could not load project members.");
    }
  };

  const edit = async (project) => {
    try {
      const [memberData] = await Promise.all([getProjectMembers(project.project_id), loadProjectSetup()]);
      const memberIds = (memberData.members || []).map((member) => String(member.employee_id));
      setOriginalMemberIds(memberIds);
      setForm({
        ...project,
        manager_id: String(project.manager_id),
        department_id: String(project.department_id),
        start_date: project.start_date?.slice(0, 10),
        end_date: project.end_date?.slice(0, 10),
        required_skills: asText(project.required_skills),
        required_roles: asText(project.required_roles),
        member_ids: memberIds,
      });
    } catch {
      toast.error("Could not load team members for this project.");
    }
  };

  const syncMembers = async (projectId, desiredIds, previousIds = []) => {
    const desired = new Set(desiredIds.map(String));
    const previous = new Set(previousIds.map(String));
    const addIds = [...desired].filter((id) => !previous.has(id));
    const removeIds = [...previous].filter((id) => !desired.has(id));

    await Promise.all(addIds.map((employeeId) => addProjectMember(projectId, { employee_id: Number(employeeId), role_in_project: "member" })));
    await Promise.all(removeIds.map((employeeId) => removeProjectMember(projectId, employeeId)));
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        required_skills: form.required_skills.split(",").map((item) => item.trim()).filter(Boolean),
        required_roles: form.required_roles.split(",").map((item) => item.trim()).filter(Boolean),
      };

      if (form.project_id) {
        await updateProject(form.project_id, payload);
        await syncMembers(form.project_id, form.member_ids || [], originalMemberIds);
      } else {
        const result = await createProject(payload);
        const projectId = result.project?.project_id;
        if (projectId && form.member_ids?.length) {
          await syncMembers(projectId, form.member_ids, []);
        }
      }

      toast.success(`Project ${form.project_id ? "updated" : "created"}.`);
      setForm(null);
      setOriginalMemberIds([]);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save project.");
    }
  };

  const createProjectForm = async () => {
    try {
      const setup = await loadProjectSetup();
      setForm({ ...blank, manager_id: setup.managers[0] ? String(setup.managers[0].employee_id) : "", department_id: setup.departments[0] ? String(setup.departments[0].department_id) : "" });
    } catch {
      toast.error("Could not load managers, departments, or employees for a new project.");
    }
  };

  const toggleMember = (employeeId) => {
    const value = String(employeeId);
    setForm((current) => {
      const memberIds = new Set(current.member_ids || []);
      if (memberIds.has(value)) memberIds.delete(value); else memberIds.add(value);
      return { ...current, member_ids: [...memberIds] };
    });
  };

  const addSuggestedMember = () => {
    if (!suggestedMember?.employee_id) return;
    if (selectedTeamMembers.includes(String(suggestedMember.employee_id))) return;
    setSelectedTeamMembers((current) => [...current, String(suggestedMember.employee_id)]);
  };

  const visibleEmployees = useMemo(() => employees.filter((employee) => !teamMembers.some((member) => Number(member.employee_id) === Number(employee.employee_id))), [employees, teamMembers]);

  return <>
    <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
      <div><h1 className="admin-page-title">Project Planning</h1><p className="text-white-50 mb-0">Define the exact skills, roles, and team capacity before delivery starts.</p></div>
      <button className="btn btn-primary" onClick={createProjectForm}><i className="bi bi-plus-lg me-2" />New project</button>
    </div>

    {loadError && <div className="portfolio-error" role="alert"><div><strong>Projects could not be loaded</strong><span>{loadError}</span></div><button className="btn btn-outline-primary" onClick={load}><i className="bi bi-arrow-clockwise me-2" />Retry</button></div>}
    {isLoading && <div className="portfolio-loading"><span className="spinner-border spinner-border-sm" aria-hidden="true" />Loading projects…</div>}

    {form && <form className="admin-panel mb-4" onSubmit={save}><div className="d-flex justify-content-between mb-3"><h5 className="mb-0">{form.project_id ? "Edit project" : "Create project"}</h5><button className="btn-close btn-close-white" type="button" onClick={() => setForm(null)} /></div><div className="row g-3"><Field label="Project name"><input required className="form-control" value={form.project_name} onChange={(event) => setForm({ ...form, project_name: event.target.value })} /></Field><Field label="Manager"><select required className="form-select" value={form.manager_id} onChange={(event) => setForm({ ...form, manager_id: event.target.value })}><option value="">Select manager</option>{managers.map((manager) => <option value={manager.employee_id} key={manager.employee_id}>{manager.full_name}</option>)}</select></Field><Field label="Department"><select required className="form-select" value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })}><option value="">Select department</option>{departments.map((department) => <option value={department.department_id} key={department.department_id}>{department.department_name}</option>)}</select></Field><Field label="Priority"><select className="form-select" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{["Low", "Medium", "High", "Critical"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Start date"><input required type="date" className="form-control" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></Field><Field label="End date"><input required type="date" className="form-control" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} /></Field><Field label="Maximum team size"><input required min="1" type="number" className="form-control" value={form.maximum_team_size} onChange={(event) => setForm({ ...form, maximum_team_size: event.target.value })} /></Field><Field label="Status"><select className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{["Active", "On Hold", "Completed"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Required skills (comma-separated)" wide><input className="form-control" value={form.required_skills} onChange={(event) => setForm({ ...form, required_skills: event.target.value })} placeholder="React, Node.js, PostgreSQL" /></Field><Field label="Required roles (comma-separated)" wide><input className="form-control" value={form.required_roles} onChange={(event) => setForm({ ...form, required_roles: event.target.value })} placeholder="Frontend Developer, Backend Developer" /></Field><Field label="Team members" wide><select multiple className="form-select" value={form.member_ids} onChange={(event) => setForm({ ...form, member_ids: Array.from(event.target.selectedOptions, (option) => option.value) })} style={{ minHeight: 180 }}>{employees.map((employee) => <option key={employee.employee_id} value={employee.employee_id}>{employee.full_name}</option>)}</select><small className="text-white-50 d-block mt-2">Select the employees who should be visible to the manager when tasks are assigned.</small></Field><Field label="Description" wide><textarea className="form-control" value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div><button className="btn btn-primary me-2">Save project</button><button type="button" className="btn btn-outline-light" onClick={() => setForm(null)}>Cancel</button></div></div></form>}

    <div className="project-card-grid">{projects.map((project) => { const { label, tone, completion } = healthTone(project); const end = project.end_date?.slice(0, 10); return <article className="project-portfolio-card" key={project.project_id}><div className="d-flex justify-content-between align-items-start gap-3"><span className={`project-health ${tone}`}><i className="bi bi-activity" /> {label}</span><div className="d-flex gap-1"><button className="btn btn-sm btn-outline-light" onClick={() => loadTeam(project)}><i className="bi bi-people" /></button><button className="btn btn-sm btn-outline-light" onClick={() => edit(project)} aria-label={`Edit ${project.project_name}`}><i className="bi bi-pencil" /></button><button className="btn btn-sm btn-outline-danger" onClick={async () => { if (!window.confirm(`Delete ${project.project_name}?`)) return; try { await deleteProject(project.project_id); toast.success("Project deleted."); load(); } catch (error) { toast.error(error.response?.data?.message || "Could not delete project."); } }} aria-label={`Delete ${project.project_name}`}><i className="bi bi-trash" /></button></div></div><h3>{project.project_name}</h3><p>{project.description || "A delivery initiative ready for staffing and execution."}</p><div className="project-meta"><span><i className="bi bi-person" /> {project.manager || "Unassigned"}</span><span><i className="bi bi-calendar3" /> {end || "No deadline"}</span></div><div className="project-skills"><span>{asText(project.required_roles) || "Roles to define"}</span><span>{asText(project.required_skills) || "Skills to define"}</span></div><div className="project-card-footer"><span><i className="bi bi-people" /> {project.member_count || 0} members</span><span className={`badge ${project.status === "Completed" ? "text-bg-success" : project.status === "On Hold" ? "text-bg-warning" : "text-bg-primary"}`}>{project.status}</span></div><div className="progress mt-3" style={{ height: 8 }}><div className={`progress-bar bg-${tone === "danger" ? "danger" : tone === "warning" ? "warning" : "success"}`} style={{ width: `${completion}%` }} /></div></article>; })}{!projects.length && <div className="empty-state">No projects yet. Create the first initiative to begin planning.</div>}</div>

    {teamProject && <div className="modal d-block" role="dialog"><div className="modal-dialog modal-xl modal-dialog-centered"><div className="modal-content bg-dark border-secondary"><div className="modal-header"><div><h5 className="modal-title mb-0">{teamProject.project_name} team</h5><small className="text-white-50">Manage members without leaving the project workspace.</small></div><button className="btn-close btn-close-white" onClick={() => setTeamProject(null)} /></div><div className="modal-body"><div className="row g-4"><div className="col-lg-4"><div className="admin-panel h-100"><h6>Suggested member</h6>{suggestedMember ? <div className="d-flex align-items-center justify-content-between gap-3"><div><strong>{suggestedMember.full_name}</strong><div className="small text-white-50">{suggestedMember.department_name || "No department"}</div></div><button className="btn btn-sm btn-primary" onClick={addSuggestedMember}>Select</button></div> : <div className="empty-state">No available suggestions.</div>}<hr className="border-secondary" /><h6 className="mb-3">Add members</h6><select multiple className="form-select mb-3" size={8} value={selectedTeamMembers} onChange={(event) => setSelectedTeamMembers(Array.from(event.target.selectedOptions, (option) => option.value))}>{availableTeam.map((employee) => <option key={employee.employee_id} value={employee.employee_id}>{employee.full_name} · {employee.active_tasks} active</option>)}</select><button className="btn btn-primary w-100" onClick={async () => { try { await Promise.all(selectedTeamMembers.map((employeeId) => addProjectMember(teamProject.project_id, { employee_id: Number(employeeId), role_in_project: "member" }))); toast.success("Members added."); await loadTeam(teamProject); await load(); } catch (error) { toast.error(error.response?.data?.message || "Could not add members."); } }}>Add selected</button></div></div><div className="col-lg-8"><div className="row g-3">{teamMembers.length ? teamMembers.map((member) => <div className="col-md-6" key={member.employee_id}><div className="manager-team-card h-100"><div className="d-flex align-items-center justify-content-between gap-3"><div className="d-flex align-items-center gap-3"><span className="team-avatar">{member.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h5 className="mb-0">{member.full_name}</h5><small className="text-white-50">{member.designation} · {member.department_name || "Department"}</small></div></div><button className="btn btn-sm btn-outline-danger" onClick={async () => { if (!window.confirm(`Remove ${member.full_name} from this project?`)) return; try { await removeProjectMember(teamProject.project_id, member.employee_id); toast.success("Member removed."); await loadTeam(teamProject); await load(); } catch (error) { toast.error(error.response?.data?.message || "Could not remove member."); } }}><i className="bi bi-trash" /></button></div><div className="small text-white-50 mt-3">Assigned by {member.assigned_by_name || "system"}</div></div></div>) : <div className="col-12"><div className="empty-state">No members have been added yet.</div></div>}</div></div></div></div></div></div></div>}
  </>;
}
function Field({ label, children, wide = false }) { return <div className={wide ? "col-12" : "col-md-6"}><label className="form-label">{label}</label>{children}</div>; }
