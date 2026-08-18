import { NavLink } from "react-router-dom";

const navigation = {
  admin: [
    ["COMMAND", [["/admin", "Overview", "bi-grid-3x3-gap"], ["/admin/employees", "People", "bi-person-bounding-box"], ["/admin/projects", "Projects", "bi-bezier2"], ["/admin/tasks", "Work", "bi-layers"]]],
    ["INTELLIGENCE", [["/admin/reports", "Signals", "bi-activity"], ["/analytics", "Analytics", "bi-bar-chart-line"]]],
    ["SYSTEM", [["/admin/notifications", "Activity", "bi-broadcast-pin"], ["/admin/settings", "System", "bi-sliders2"]]],
  ],
  manager: [
    ["COMMAND", [["/manager", "Overview", "bi-grid-3x3-gap"], ["/manager/team", "People", "bi-person-bounding-box"], ["/manager/projects", "Projects", "bi-bezier2"], ["/manager/tasks", "Work", "bi-layers"]]],
    ["INTELLIGENCE", [["/manager/allocation", "AI Match", "bi-crosshair2"], ["/manager/calendar", "Timeline", "bi-calendar3"]]],
    ["SYSTEM", [["/manager/notifications", "Activity", "bi-broadcast-pin"], ["/manager/profile", "Profile", "bi-person-circle"]]],
  ],
  employee: [
    ["COMMAND", [["/employee", "Today", "bi-record-circle"], ["/employee/projects", "Projects", "bi-bezier2"], ["/employee/tasks", "Work", "bi-layers"]]],
    ["SYSTEM", [["/employee/calendar", "Timeline", "bi-calendar3"], ["/employee/notifications", "Activity", "bi-broadcast-pin"], ["/employee/profile", "Profile", "bi-person-circle"]]],
  ],
};

export default function CommandRail({ role }) {
  return <aside className="command-rail">
    <NavLink to={`/${role}`} className="command-mark" aria-label="Resource Command Grid home"><i className="bi bi-command" /><span>RC</span></NavLink>
    <nav>{navigation[role].map(([group, links]) => <section className="rail-group" key={group}><small>{group}</small>{links.map(([to, label, icon]) => <NavLink end={to === `/${role}`} to={to} key={to} title={label}><i className={`bi ${icon}`} /><span>{label}</span></NavLink>)}</section>)}</nav>
    <div className="rail-live"><span />LIVE</div>
  </aside>;
}
