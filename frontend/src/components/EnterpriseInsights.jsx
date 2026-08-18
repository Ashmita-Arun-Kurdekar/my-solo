import { motion } from "../lib/motionShim";

const activeStatuses = new Set(["Pending", "In Progress", "On Hold"]);
const today = () => new Date().toISOString().slice(0, 10);

// These calculations deliberately use existing task data only; no API contract changes are required.
export const workloadFor = (employee, tasks) => {
  const assigned = tasks.filter((task) => Number(task.assigned_to_id) === Number(employee.employee_id));
  const active = assigned.filter((task) => activeStatuses.has(task.status));
  const highPriority = active.filter((task) => task.priority === "High").length;
  const completed = assigned.filter((task) => task.status === "Completed").length;
  const percent = Math.min(100, active.length * 18 + highPriority * 10);
  return { assigned, active, completed, percent, tone: percent >= 75 ? "danger" : percent >= 45 ? "warning" : "success" };
};

export function WorkloadCards({ employees = [], tasks = [], limit = 5 }) {
  const people = employees.filter((person) => Number(person.role_id) === 3).map((person) => ({ person, workload: workloadFor(person, tasks) })).sort((a, b) => b.workload.percent - a.workload.percent).slice(0, limit);
  return <section className="insight-panel h-100"><div className="d-flex align-items-center justify-content-between mb-4"><div><span className="eyebrow">RESOURCE UTILIZATION</span><h5 className="mb-0">Team capacity</h5></div><span className="insight-orb"><i className="bi bi-speedometer2" /></span></div>{people.length ? <div className="workload-list">{people.map(({ person, workload }, index) => <motion.article key={person.employee_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .06 }} className="workload-item"><div className="workload-avatar">{person.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "U"}</div><div className="flex-grow-1 min-w-0"><div className="d-flex justify-content-between gap-2"><strong className="text-truncate">{person.full_name}</strong><span className={`workload-status ${workload.tone}`}>{workload.percent >= 75 ? "Busy" : workload.percent >= 45 ? "Balanced" : "Available"}</span></div><small>{person.department_name || "Unassigned department"} · {workload.active.length} active tasks</small><div className="workload-track mt-2"><motion.span initial={{ width: 0 }} animate={{ width: `${workload.percent}%` }} transition={{ duration: .7, delay: index * .06 }} className={workload.tone} /></div></div><strong className={`workload-number ${workload.tone}`}>{workload.percent}%</strong></motion.article>)}</div> : <div className="empty-state">Workload insights appear once employees and tasks are available.</div>}</section>;
}

export function InsightFeed({ employees = [], projects = [], tasks = [] }) {
  const overdue = tasks.filter((task) => task.status !== "Completed" && task.due_date?.slice(0, 10) < today()).length;
  const overloaded = employees.filter((person) => Number(person.role_id) === 3 && workloadFor(person, tasks).percent >= 75).length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const activeProjects = projects.filter((project) => project.status === "Active").length;
  const insights = [
    { icon: "bi-lightning-charge-fill", tone: "blue", title: `${overloaded} employees need workload attention`, text: overloaded ? "Rebalance upcoming assignments to protect delivery timelines." : "Team capacity is balanced across current assignments." },
    { icon: "bi-calendar-x", tone: overdue ? "red" : "teal", title: overdue ? `${overdue} tasks are overdue` : "No overdue tasks detected", text: overdue ? "Review delayed work and prioritise manager follow-up." : "Delivery is currently on track." },
    { icon: "bi-graph-up-arrow", tone: "teal", title: `${completion}% task completion`, text: `${activeProjects} active projects are contributing to the current delivery pulse.` },
  ];
  return <section className="insight-panel h-100"><span className="eyebrow">OPERATING SIGNALS</span><h5 className="mb-4">Recommendations</h5><div className="signal-list">{insights.map((item, index) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .07 }} className="signal-row" key={item.title}><span className={`signal-icon ${item.tone}`}><i className={`bi ${item.icon}`} /></span><div><strong>{item.title}</strong><small>{item.text}</small></div></motion.div>)}</div></section>;
}

export function ExportActions({ filename, rows }) {
  const downloadCsv = () => {
    if (!rows?.length) return;
    const keys = Object.keys(rows[0]);
    const content = [keys.join(","), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    anchor.download = `${filename}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  return <div className="export-actions"><button type="button" className="btn btn-outline-light btn-sm" onClick={downloadCsv} disabled={!rows?.length}><i className="bi bi-filetype-csv me-1" />CSV / Excel</button><button type="button" className="btn btn-outline-light btn-sm" onClick={() => window.print()}><i className="bi bi-printer me-1" />Print / PDF</button></div>;
}
