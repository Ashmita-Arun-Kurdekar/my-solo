import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "../lib/motionShim";
import { useAuth } from "../context/AuthContext";

const roles = [
  { id: 1, label: "Administrator", description: "Organization control", icon: "bi-shield-check" },
  { id: 2, label: "Manager", description: "Projects and team", icon: "bi-person-workspace" },
  { id: 3, label: "Employee", description: "My work and tasks", icon: "bi-person" },
];
const home = (role) => Number(role) === 1 ? "/admin" : Number(role) === 2 ? "/manager" : "/employee";

export default function Login() {
  const { login, logout } = useAuth(); const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(roles[2]); const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true); const [showPassword, setShowPassword] = useState(false); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(null);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 4000); return () => clearTimeout(timer); }, [notice]);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setNotice(null); try { const user = await login(form, { remember }); const actualRole = Number(user?.role ?? user?.role_id); if (actualRole !== selectedRole.id) { logout(); setNotice({ type: "danger", message: `This account is not registered as ${selectedRole.label}.` }); return; } setNotice({ type: "success", message: `Welcome back, ${user?.name || "there"}.` }); setTimeout(() => navigate(home(actualRole), { replace: true }), 450); } catch (error) { setNotice({ type: "danger", message: error.response?.data?.message || "We couldn't sign you in. Check your credentials and try again." }); } finally { setBusy(false); } };
  return <div className="login-page"><div className="login-orb login-orb-one" /><div className="login-orb login-orb-two" /><div className="login-grid" />
    {notice && <div className={`login-notice alert alert-${notice.type} alert-dismissible fade show`} role="alert">{notice.message}<button className="btn-close" onClick={() => setNotice(null)} /></div>}
    <motion.main initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="login-card">
      <section className="login-showcase"><div><div className="login-logo"><i className="bi bi-diagram-3-fill" /></div><span className="login-kicker">RESOURCE ALLOCATION SYSTEM</span><h1>Make work flow,<br /><em>beautifully.</em></h1><p>Plan projects, align teams, and keep every priority moving in one secure workspace.</p></div><div className="login-benefits"><div><i className="bi bi-shield-lock" /><span><strong>Secure access</strong><small>Role-based JWT authentication</small></span></div><div><i className="bi bi-graph-up-arrow" /><span><strong>Clear visibility</strong><small>Projects, people, and progress</small></span></div></div></section>
      <section className="login-form-panel"><div className="login-mobile-brand"><i className="bi bi-diagram-3-fill" /> FlowBoard</div><div className="mb-4"><span className="login-kicker">WELCOME BACK</span><h2>Sign in to your workspace</h2><p>Choose your workspace, then enter your credentials.</p></div><div className="role-picker mb-4">{roles.map((role) => <button type="button" key={role.id} onClick={() => setSelectedRole(role)} className={`role-option ${selectedRole.id === role.id ? "selected" : ""}`}><i className={`bi ${role.icon}`} /><span><strong>{role.label}</strong><small>{role.description}</small></span><i className="bi bi-check-circle-fill role-check" /></button>)}</div>
        <form onSubmit={submit}><label className="form-label" htmlFor="email">Work email</label><div className="login-input mb-3"><i className="bi bi-envelope" /><input id="email" type="email" name="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></div><div className="d-flex justify-content-between align-items-center"><label className="form-label" htmlFor="password">Password</label><button type="button" className="login-text-button">Forgot password?</button></div><div className="login-input mb-3"><i className="bi bi-lock" /><input id="password" type={showPassword ? "text" : "password"} name="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"><i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} /></button></div><label className="form-check login-remember mb-4"><input className="form-check-input" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>Keep me signed in</span></label><button className="btn login-submit w-100" disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : <>Sign in as {selectedRole.label}<i className="bi bi-arrow-right" /></>}</button></form><p className="login-register">Need an account? <Link to="/register">Create one</Link></p>
      </section>
    </motion.main><p className="login-footer">© 2026 FlowBoard · Resource Allocation System</p>
  </div>;
}
