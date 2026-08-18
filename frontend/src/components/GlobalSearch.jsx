import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "../services/employeeService";
import { getProjects } from "../services/projectService";
import { getTasks } from "../services/taskService";

// A small client-side command search built from existing protected endpoints.
export default function GlobalSearch() {
  const [query, setQuery] = useState(""); const [results, setResults] = useState([]); const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return undefined; }
    const timer = setTimeout(async () => {
      const [people, projects, tasks] = await Promise.allSettled([getEmployees(), getProjects(), getTasks()]);
      const term = query.toLowerCase(); const found = [];
      if (people.status === "fulfilled") (people.value.employees || []).filter((item) => `${item.full_name} ${item.email}`.toLowerCase().includes(term)).slice(0, 3).forEach((item) => found.push({ label: item.full_name, detail: item.email, icon: "bi-person", to: "/admin/employees" }));
      if (projects.status === "fulfilled") (projects.value.projects || []).filter((item) => `${item.project_name} ${item.description || ""}`.toLowerCase().includes(term)).slice(0, 3).forEach((item) => found.push({ label: item.project_name, detail: "Project", icon: "bi-folder", to: "/admin/projects" }));
      if (tasks.status === "fulfilled") (tasks.value.tasks || []).filter((item) => `${item.task_title} ${item.project_name || ""}`.toLowerCase().includes(term)).slice(0, 3).forEach((item) => found.push({ label: item.task_title, detail: item.project_name || "Task", icon: "bi-check2-square", to: "/admin/tasks" }));
      setResults(found);
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);
  const choose = (to) => { setQuery(""); setOpen(false); navigate(to); };
  return <div className="global-search"><i className="bi bi-search" /><input aria-label="Search employees, projects, and tasks" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="Search workspace…" />{open && query.length >= 2 && <div className="global-search-menu">{results.length ? results.map((item, index) => <button type="button" onMouseDown={() => choose(item.to)} key={`${item.label}-${index}`}><i className={`bi ${item.icon}`} /><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>) : <p>No matching people, projects, or tasks.</p>}</div>}</div>;
}
