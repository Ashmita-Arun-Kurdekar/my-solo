import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../services/taskService";
import { getNotifications, markNotificationAsRead } from "../services/notificationService";
export function EmployeeCalendar() { const [tasks,setTasks]=useState([]); useEffect(()=>{getTasks().then(d=>setTasks(d.tasks||[]));},[]); return <main className="container py-4"><h2>Calendar</h2><p className="text-white-50">Task and project deadlines from your assigned work.</p><div className="card glass-panel p-4">{tasks.length?tasks.sort((a,b)=>new Date(a.due_date)-new Date(b.due_date)).map(t=><div key={t.task_id} className="d-flex gap-3 border-bottom border-secondary-subtle py-3"><div className="text-info"><i className="bi bi-calendar-event fs-4" /></div><div><strong>{t.task_title}</strong><div className="small text-white-50">{t.project_name} · Due {t.due_date?.slice(0,10)}</div></div></div>):<p className="text-white-50 mb-0">No deadlines to show.</p>}</div></main>; }
const notificationIcon = (type) => type === "task_assigned" ? "bi-bell-fill text-info" : type === "task_updated" ? "bi-pencil-square text-warning" : type === "task_status_updated" ? "bi-arrow-repeat text-success" : "bi-bell text-info";
const formatNotificationDate = (value) => value ? new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Just now";

export function EmployeeNotifications() {
	const [notifications, setNotifications] = useState([]); const [loading, setLoading] = useState(true);
	const loadNotifications = async () => {
		try {
			const data = await getNotifications();
			setNotifications(data.notifications || []);
			window.dispatchEvent(new Event("notifications:updated"));
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => { loadNotifications(); }, []);
	const markRead = async (id) => {
		try {
			await markNotificationAsRead(id);
			await loadNotifications();
		} catch (error) {
			alert(error.response?.data?.message || "Unable to update notification.");
		}
	};
	return <main className="container py-4"><div className="d-flex justify-content-between align-items-end gap-3 mb-3"><div><h2 className="mb-1">Notifications</h2><p className="text-white-50 mb-0">Updates related to your work will appear here.</p></div><span className="badge text-bg-info">{notifications.filter((item) => !item.is_read).length} unread</span></div><div className="card glass-panel p-4">{loading ? <div className="text-center py-5 text-white-50"><div className="spinner-border text-info mb-3" role="status" /><div>Loading notifications…</div></div> : notifications.length ? notifications.map((item) => <div key={item.notification_id} className={`d-flex gap-3 align-items-start py-3 ${!item.is_read ? "border-bottom border-secondary-subtle" : "border-bottom border-secondary-subtle opacity-75"}`}><i className={`bi ${notificationIcon(item.notification_type)} fs-4 mt-1`} /><div className="flex-grow-1"><div className="d-flex justify-content-between gap-3"><strong>{item.title}</strong><span className="text-white-50 small">{formatNotificationDate(item.created_at)}</span></div><div className="text-white-50 small mt-1">{item.message}</div><div className="mt-2">{!item.is_read ? <button className="btn btn-sm btn-outline-light" onClick={() => markRead(item.notification_id)}>Mark as read</button> : <span className="badge text-bg-secondary">Read</span>}</div></div></div>) : <div className="text-center py-5"><i className="bi bi-bell fs-2 text-info d-block mb-3"/><h5>You’re all caught up</h5><p className="text-white-50 mb-0">There are no new task or project notifications.</p></div>}</div></main>;
}
export function EmployeeProfile() { const {user}=useAuth(); return <main className="container py-4"><h2>My Profile</h2><p className="text-white-50">Your account information.</p><div className="card glass-panel p-4 col-lg-8"><div className="d-flex align-items-center gap-3 mb-4"><div className="rounded-circle d-flex align-items-center justify-content-center bg-primary" style={{width:72,height:72}}><i className="bi bi-person fs-2"/></div><div><h4 className="mb-1">{user?.name||user?.full_name||"Employee"}</h4><span className="badge text-bg-info">Employee</span></div></div><dl className="row mb-0"><dt className="col-sm-4 text-white-50">Email</dt><dd className="col-sm-8">{user?.email||"—"}</dd><dt className="col-sm-4 text-white-50">Role</dt><dd className="col-sm-8">Employee</dd><dt className="col-sm-4 text-white-50">Department</dt><dd className="col-sm-8">{user?.department_name||"Not available"}</dd><dt className="col-sm-4 text-white-50">Designation</dt><dd className="col-sm-8">{user?.designation||"Not available"}</dd></dl><div className="alert alert-secondary mt-4 mb-0 small">Profile changes are unavailable because the current API does not provide an employee self-update endpoint.</div></div></main>; }
