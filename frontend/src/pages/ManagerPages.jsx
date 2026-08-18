import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAvailableEmployees, getProjectMembers, getProjects, suggestBestEmployee, addProjectMember, removeProjectMember } from "../services/projectService";
import { createTask, getEmployees, getProjects as getTaskProjects, getTasks, updateTask, updateTaskStatus } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { motion } from "../lib/motionShim";

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not set";
const blankTask = { project_id: "", assigned_to: "", task_title: "", description: "", priority: "Medium", status: "Pending", assigned_date: new Date().toISOString().slice(0, 10), due_date: "" };
const statusClass = (status) => status === "Completed" ? "text-bg-success" : status === "On Hold" ? "text-bg-warning" : "text-bg-primary";

export function ManagerProjects() {
  const [projects, setProjects] = useState([]); const [tasks, setTasks] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const [projectResult, taskResult] = await Promise.allSettled([getProjects(), getTasks()]);
      if (!active) return;
      if (projectResult.status === "fulfilled") setProjects(projectResult.value.projects || []);
      if (taskResult.status === "fulfilled") setTasks(taskResult.value.tasks || []);
      setLoading(false);
    };
    load();
    const refreshId = window.setInterval(load, 5000);
    return () => { active = false; window.clearInterval(refreshId); };
  }, []);
  if (loading) return <Loading />;
  return <PageTitle title="My Projects" text="Projects assigned to you and their delivery health."><div className="row g-4">{projects.map((project) => { const items = tasks.filter((task) => task.project_id === project.project_id); const completed = items.filter((task) => task.status === "Completed").length; const members = new Set(items.map((task) => task.assigned_to_id)).size; const progress = items.length ? Math.round(completed / items.length * 100) : 0; return <div className="col-md-6 col-xl-4" key={project.project_id}><article className="manager-project-card h-100"><div className="d-flex justify-content-between gap-2"><span className={`badge ${statusClass(project.status)}`}>{project.status}</span><span className="text-white-50 small"><i className="bi bi-calendar-event me-1" />{formatDate(project.end_date)}</span></div><h4 className="mt-3">{project.project_name}</h4><p className="text-white-50 small project-description">{project.description || "No project description provided."}</p><div className="d-flex justify-content-between small mt-3"><span>Progress</span><strong>{progress}%</strong></div><div className="progress manager-progress slim my-2"><div className="progress-bar" style={{ width: `${progress}%` }} /></div><div className="d-flex justify-content-between text-white-50 small"><span><i className="bi bi-people me-1" />{members} team members</span><span>{completed}/{items.length} tasks</span></div><div className="d-flex gap-2 mt-4"><Link className="btn btn-sm btn-outline-light flex-fill" to={`/manager/tasks?project=${project.project_id}`}>View details</Link><Link className="btn btn-sm btn-primary flex-fill" to={`/manager/tasks?project=${project.project_id}&assign=1`}>Assign tasks</Link></div></article></div>; })}{!projects.length && <Empty text="You do not have any assigned projects yet." />}</div></PageTitle>;
}

export function ManagerTasks() {
  const [tasks, setTasks] = useState([]), [projects, setProjects] = useState([]), [employees, setEmployees] = useState([]), [projectMembers, setProjectMembers] = useState([]), [form, setForm] = useState(null), [query, setQuery] = useState(""), [filter, setFilter] = useState("All"), [notice, setNotice] = useState("");
  const load = () => Promise.all([getTasks(), getTaskProjects(), getEmployees()]).then(([t,p,e]) => { setTasks(t.tasks || []); setProjects(p.projects || []); setEmployees(e.employees || []); });
  useEffect(() => { load().catch(() => setNotice("Unable to load team tasks.")); }, []);
  useEffect(() => { if (!form?.project_id) { setProjectMembers([]); return; } getProjectMembers(form.project_id).then((data) => setProjectMembers(data.members || [])).catch(() => setProjectMembers([])); }, [form?.project_id]);
  const visible = useMemo(() => tasks.filter((task) => (filter === "All" || task.status === filter) && `${task.task_title} ${task.project_name} ${task.assigned_to}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => new Date(a.due_date) - new Date(b.due_date)), [tasks, query, filter]);
  const save = async (event) => { event.preventDefault(); try { form.task_id ? await updateTask(form.task_id, form) : await createTask(form); setNotice(`Task ${form.task_id ? "updated" : "assigned"} successfully.`); setForm(null); load(); } catch (error) { setNotice(error.response?.data?.message || "Unable to save task."); } };
  const change = (task, key, value) => setForm({ ...task, [key]: value, assigned_to: task.assigned_to_id, assigned_date: task.assigned_date?.slice(0,10), due_date: task.due_date?.slice(0,10) });
  const move = async (task, status) => { if (status === "Review") { setNotice("Review is displayed for planning, but the current task API supports Pending, In Progress, and Completed only."); return; } if (task.status === status) return; const previous = tasks; setTasks(current => current.map(item => item.task_id === task.task_id ? { ...item, status } : item)); try { await updateTaskStatus(task.task_id, status); } catch { setTasks(previous); setNotice("Could not update task status."); } };
  return <PageTitle title="Work Board" text="Move delivery forward with a live view of every team commitment." action={<button className="btn btn-primary" onClick={() => setForm(blankTask)}><i className="bi bi-plus-lg me-2" />Assign task</button>}>{notice && <div className="alert alert-info alert-dismissible"><span>{notice}</span><button className="btn-close" onClick={() => setNotice("")} /></div>}{form && <TaskForm form={form} setForm={setForm} save={save} projects={projects} employees={form?.project_id ? projectMembers : []} cancel={() => setForm(null)} />}<div className="manager-panel"><div className="row g-2 mb-4"><div className="col-md"><div className="input-group"><span className="input-group-text"><i className="bi bi-search" /></span><input className="form-control" placeholder="Search task, project, or employee" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div><div className="col-md-3"><select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>{["All", "Pending", "In Progress", "Completed"].map((item) => <option key={item}>{item}</option>)}</select></div></div><KanbanBoard tasks={visible} onEdit={change} onMove={move} /></div></PageTitle>;
}

function KanbanBoard({ tasks, onEdit, onMove }) { const columns = ["Pending", "In Progress", "Completed"]; return <div className="kanban-board">{columns.map((column) => { const items = tasks.filter((task) => task.status === column); return <section className="kanban-column" key={column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const task = JSON.parse(event.dataTransfer.getData("application/task")); onMove(task, column); }}><header><div><span className={`kanban-dot ${column.toLowerCase().replace(" ", "-")}`} /><strong>{column}</strong></div><span>{items.length}</span></header><div className="kanban-cards">{items.map((task) => <article className="kanban-card" key={task.task_id} draggable onDragStart={(event) => event.dataTransfer.setData("application/task", JSON.stringify(task))}><div className="d-flex justify-content-between gap-2"><span className={`badge ${task.priority === "High" ? "text-bg-danger" : task.priority === "Low" ? "text-bg-info" : "text-bg-secondary"}`}>{task.priority}</span><button className="kanban-edit" onClick={() => onEdit(task, "task_id", task.task_id)} aria-label={`Edit ${task.task_title}`}><i className="bi bi-pencil" /></button></div><h6>{task.task_title}</h6><p>{task.description || "No description provided."}</p><footer><span>{task.assigned_to || "Unassigned"}</span><span className={new Date(task.due_date) < new Date() && task.status !== "Completed" ? "text-danger" : ""}>{formatDate(task.due_date)}</span></footer></article>)}{!items.length && <div className="kanban-empty">Drop work here</div>}</div></section>; })}</div> }

function TaskForm({ form, setForm, save, projects, employees, cancel }) { const set = (key, value) => setForm({ ...form, [key]: value }); return <form className="manager-panel mb-4" onSubmit={save}><div className="d-flex justify-content-between mb-3"><h5 className="mb-0">{form.task_id ? "Update task" : "Assign a new task"}</h5><button type="button" className="btn-close btn-close-white" onClick={cancel} /></div><div className="row g-3"><div className="col-md-6"><select required className="form-select" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">Select project</option>{projects.map((p) => <option value={p.project_id} key={p.project_id}>{p.project_name}</option>)}</select></div><div className="col-md-6"><select required className="form-select" value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)}><option value="">Assign employee</option>{employees.map((e) => <option value={e.employee_id} key={e.employee_id}>{e.full_name}</option>)}</select></div><div className="col-md-6"><input required className="form-control" placeholder="Task title" value={form.task_title} onChange={(e) => set("task_title", e.target.value)} /></div><div className="col-md-3"><select className="form-select" value={form.priority} onChange={(e) => set("priority", e.target.value)}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select></div><div className="col-md-3"><select className="form-select" value={form.status} onChange={(e) => set("status", e.target.value)}>{["Pending", "In Progress", "Completed"].map((s) => <option key={s}>{s}</option>)}</select></div><div className="col-md-6"><input required type="date" className="form-control" value={form.assigned_date || ""} onChange={(e) => set("assigned_date", e.target.value)} /></div><div className="col-md-6"><input required type="date" className="form-control" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></div><div className="col-12"><textarea className="form-control" placeholder="Description" value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></div><div><button className="btn btn-primary me-2">Save task</button><button type="button" className="btn btn-outline-light" onClick={cancel}>Cancel</button></div></div></form>; }

export function ManagerTeam() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [membersByProject, setMembersByProject] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([getTasks(), getProjects()]).then(async ([taskData, projectData]) => {
      if (!active) return;
      const currentProjects = projectData.projects || [];
      setTasks(taskData.tasks || []);
      setProjects(currentProjects);
      const memberSets = await Promise.all(currentProjects.map(async (project) => {
        try {
          const data = await getProjectMembers(project.project_id);
          return { project_id: project.project_id, project_name: project.project_name, members: data.members || [] };
        } catch {
          return { project_id: project.project_id, project_name: project.project_name, members: [] };
        }
      }));
      if (active) setMembersByProject(memberSets);
    });
    return () => { active = false; };
  }, []);

  const team = useMemo(() => {
    const roster = new Map();

    membersByProject.forEach(({ project_name, members }) => {
      members.forEach((member) => {
        const current = roster.get(member.employee_id) || { ...member, projects: [] };
        current.projects = [...new Set([...current.projects, project_name])];
        roster.set(member.employee_id, current);
      });
    });

    return [...roster.values()];
  }, [membersByProject]);

  return <PageTitle title="My Team" text="Monitor workload and task progress for people working on your projects."><div className="row g-4">{team.map((employee) => { const own = tasks.filter((task) => task.assigned_to_id === employee.employee_id); const done = own.filter((task) => task.status === "Completed").length; const workload = own.filter((task) => task.status !== "Completed").length; return <div className="col-md-6 col-xl-4" key={employee.employee_id}><div className="manager-team-card"><div className="d-flex align-items-center gap-3"><span className="team-avatar">{employee.full_name?.split(" ").map((p) => p[0]).slice(0,2).join("")}</span><div><h5 className="mb-0">{employee.full_name}</h5><small className="text-white-50">{employee.designation} · {employee.department_name || "Department"}</small></div></div><div className="small text-white-50 mt-2">{employee.projects?.join(" · ") || "Project member"}</div><div className="row text-center mt-4"><div className="col"><strong>{own.length}</strong><small>Assigned</small></div><div className="col"><strong className="text-success">{done}</strong><small>Completed</small></div><div className="col"><strong className="text-warning">{workload}</strong><small>Pending</small></div></div><div className="progress manager-progress slim mt-3"><div className="progress-bar" style={{ width: `${own.length ? done / own.length * 100 : 0}%` }} /></div></div></div>; })}{!team.length && <Empty text="Team members appear here once they are added to a project." />}</div></PageTitle>;
}

export function ManagerCalendar() { const [tasks, setTasks] = useState([]), [projects, setProjects] = useState([]); useEffect(() => { Promise.all([getTasks(), getProjects()]).then(([t,p]) => { setTasks(t.tasks || []); setProjects(p.projects || []); }); }, []); const events = [...projects.map((p) => ({ title: p.project_name, type: "Project deadline", date: p.end_date })), ...tasks.map((t) => ({ title: t.task_title, type: `${t.assigned_to} · ${t.status}`, date: t.due_date }))].filter((e) => e.date).sort((a,b) => new Date(a.date)-new Date(b.date)); return <PageTitle title="Calendar" text="Project and task deadlines for your managed work."><div className="manager-panel">{events.map((event, index) => <div className="calendar-event" key={`${event.title}-${index}`}><div className="calendar-day"><strong>{new Date(event.date).getDate()}</strong><span>{new Date(event.date).toLocaleDateString(undefined,{month:"short"})}</span></div><div><strong>{event.title}</strong><div className="text-white-50 small">{event.type}</div></div></div>)}{!events.length && <Empty text="No deadlines have been scheduled." />}</div></PageTitle>; }

export function ManagerNotifications() { const [tasks, setTasks] = useState([]); useEffect(() => { getTasks().then((data) => setTasks(data.tasks || [])); }, []); const notifications = tasks.filter((task) => task.status === "Completed" || (task.due_date && new Date(task.due_date) - new Date() < 7 * 86400000)).slice(0, 8); return <PageTitle title="Notifications" text="Important updates from your projects and team."><div className="manager-panel">{notifications.map((task) => <div className="notification-row" key={task.task_id}><i className={`bi ${task.status === "Completed" ? "bi-check-circle-fill text-success" : "bi-alarm-fill text-warning"}`} /><div><strong>{task.status === "Completed" ? "Task completed" : "Deadline approaching"}</strong><div className="text-white-50 small">{task.assigned_to}: {task.task_title} · {formatDate(task.due_date)}</div></div></div>)}{!notifications.length && <Empty text="You’re all caught up—no new notifications." />}</div></PageTitle>; }

export function ManagerProfile() { const { user } = useAuth(); const [phone, setPhone] = useState(user?.phone || ""), [editing, setEditing] = useState(false); return <PageTitle title="My Profile" text="Your manager account information."><div className="row"><div className="col-lg-8"><div className="manager-panel"><div className="d-flex align-items-center gap-3 mb-4"><span className="profile-avatar">{(user?.name || "M").split(" ").map((p) => p[0]).slice(0,2).join("")}</span><div><h4 className="mb-0">{user?.name || "Manager"}</h4><span className="badge text-bg-primary">Manager</span></div></div><div className="row g-3"><ProfileItem label="Email" value={user?.email || "Not available"} /><ProfileItem label="Role" value="Manager" /><ProfileItem label="Phone" value={editing ? <input className="form-control form-control-sm" value={phone} onChange={(e) => setPhone(e.target.value)} /> : phone || "Not available"} /><ProfileItem label="Department" value="Managed projects" /><ProfileItem label="Designation" value="Manager" /><ProfileItem label="Address" value={editing ? <input className="form-control form-control-sm" placeholder="Address" /> : "Not set"} /></div><div className="mt-4">{editing ? <><button className="btn btn-primary me-2" onClick={() => setEditing(false)}>Save changes</button><button className="btn btn-outline-light" onClick={() => setEditing(false)}>Cancel</button></> : <button className="btn btn-outline-light" onClick={() => setEditing(true)}><i className="bi bi-pencil me-2" />Edit contact details</button>}</div><p className="small text-white-50 mt-3 mb-0">Role, department, and designation are managed by an administrator.</p></div></div></div></PageTitle>; }
function ProfileItem({ label, value }) { return <div className="col-md-6"><div className="profile-item"><small>{label}</small><div>{value}</div></div></div>; }
function PageTitle({ title, text, action, children }) { return <><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="d-flex align-items-start justify-content-between gap-3 mb-4"><div><h1 className="manager-page-title">{title}</h1><p className="text-white-50 mb-0">{text}</p></div>{action}</motion.div><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>{children}</motion.div></>; }
function Loading() { return <div className="manager-loading"><div className="spinner-border text-primary" /><span>Loading workspace…</span></div>; }
function Empty({ text }) { return <div className="col-12 empty-state text-center"><i className="bi bi-inbox fs-2 d-block mb-2" />{text}</div>; }
