import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "../lib/motionShim";

import { useAuth } from "../context/AuthContext";

const getDashboardPath = (role) => {
  const normalizedRole = Number(role);

  if (normalizedRole === 1) return "/admin";
  if (normalizedRole === 2) return "/manager";

  return "/employee";
};

// File: src/pages/Login.jsx
// Purpose: Present a premium, animated login experience.
// Current behavior: handles user login via existing AuthContext.login() which calls the backend JWT API.
// Change: Add an initial role-selection step (Admin / Manager / Employee) presented as animated cards.
// After selecting a role the existing login form is shown. Login flow and redirects remain unchanged.

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [remember, setRemember] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setToast({ type: "danger", message: "Please select a role before signing in." });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      const loggedInUser = await login(formData, { remember });
      const role = loggedInUser?.role ?? loggedInUser?.role_id ?? 3;

      // Verify the selected role matches the backend role
      if (selectedRole && Number(selectedRole.id) !== Number(role)) {
        setToast({ type: "danger", message: "You are not authorized to login as this role." });
        // clear token/session
        try { window.localStorage.removeItem("token"); window.localStorage.removeItem("employee"); } catch {};
        try { window.sessionStorage.removeItem("token"); window.sessionStorage.removeItem("employee"); } catch {};
        setIsSubmitting(false);
        return;
      }

      setToast({
        type: "success",
        message: `Welcome back, ${loggedInUser?.name || "there"}!`,
      });

      window.setTimeout(() => {
        navigate(getDashboardPath(role), { replace: true });
      }, 700);
    } catch (error) {
      setToast({
        type: "danger",
        message: error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ROLE_OPTIONS = [
    { id: 1, key: "admin", label: "Admin", icon: "bi-shield-lock-fill", hint: "Full access" },
    { id: 2, key: "manager", label: "Manager", icon: "bi-people-fill", hint: "Manage projects & team" },
    { id: 3, key: "employee", label: "Employee", icon: "bi-person-fill", hint: "View and update tasks" },
  ];

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    // optionally clear form when role changes
    setFormData({ email: "", password: "" });
  };

  const handleBackToRole = () => {
    setSelectedRole(null);
    setToast(null);
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center justify-content-center px-3 py-5">
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
        <motion.div className="position-absolute rounded-circle" animate={{ x: [0, 40, 0], y: [0, -24, 0], scale: [1, 1.05, 1] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} style={{ width: 260, height: 260, background: "rgba(124,140,255,0.22)", filter: "blur(48px)", top: "8%", left: "6%" }} />
        <motion.div className="position-absolute rounded-circle" animate={{ x: [0, -30, 0], y: [0, 22, 0], scale: [1, 1.08, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} style={{ width: 320, height: 320, background: "rgba(77,212,198,0.2)", filter: "blur(60px)", bottom: "8%", right: "5%" }} />
        {[...Array(8)].map((_, index) => (
          <motion.span
            key={index}
            className="particle"
            animate={{ x: [0, 24, 0], y: [0, -22, 0], opacity: [0.2, 0.65, 0.2] }}
            transition={{ duration: 8 + index, repeat: Infinity, ease: "easeInOut" }}
            style={{ left: `${8 + index * 8}%`, top: `${18 + (index % 4) * 12}%`, width: 6 + index % 3, height: 6 + index % 3 }}
          />
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
            <div className={`toast show align-items-center text-bg-${toast.type} border-0`} role="alert">
              <div className="d-flex">
                <div className="toast-body">{toast.message}</div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card border-0 overflow-hidden rounded-4 hero-grid glass-panel" style={{ minHeight: "640px" }}>
              <div className="row g-0 h-100">
                <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="col-lg-7 p-4 p-lg-5 d-flex flex-column justify-content-between text-white" style={{ background: "linear-gradient(135deg, rgba(9,17,34,0.98), rgba(21,37,70,0.92))" }}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <motion.div whileHover={{ scale: 1.04 }} className="rounded-circle p-2 glow-ring" style={{ background: "rgba(255,255,255,0.16)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-diagram-3-fill fs-5" />
                      </motion.div>
                      <div>
                        <h4 className="mb-0 fw-semibold">Company Work Allocation</h4>
                        <p className="mb-0 small opacity-75">Enterprise planning suite</p>
                      </div>
                    </div>

                    <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fw-bold mb-3" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>
                      Welcome back
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lead opacity-90" style={{ maxWidth: 520 }}>
                      Select your role and sign in to continue orchestrating projects, people, and priorities across your organization.
                    </motion.p>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="d-flex flex-column gap-3 mt-4">
                    <div className="d-flex align-items-center gap-2 small opacity-80">
                      <i className="bi bi-shield-lock-fill" />
                      <span>Secure JWT authentication with role-based access</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 small opacity-80">
                      <i className="bi bi-lightning-charge-fill" />
                      <span>Fast, modern workspace for high-performing teams</span>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="col-lg-5 p-4 p-lg-5 d-flex align-items-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-100">
                    <div className="text-center mb-4">
                      <h3 className="fw-bold mb-1">Sign in</h3>
                      <p className="text-muted mb-0">Choose a login type and sign in to your workspace</p>
                    </div>

                    {/* Role selection */}
                    {!selectedRole ? (
                      <div className="d-grid gap-3">
                        <div className="d-flex gap-3 justify-content-center">
                          {ROLE_OPTIONS.map((r) => (
                            <motion.button
                              key={r.key}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectRole(r)}
                              className="btn btn-outline-light role-card p-3 text-start"
                              style={{ minWidth: 160 }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "rgba(255,255,255,0.04)" }}>
                                  <i className={`bi ${r.icon} fs-4`} />
                                </div>
                                <div>
                                  <div className="fw-semibold">{r.label}</div>
                                  <div className="small text-white-50">{r.hint}</div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div className="text-center small text-white-50">Or sign in with your credentials</div>
                      </div>
                    ) : (
                      <div className="w-100 glass-panel rounded-4 p-4 p-lg-4 glow-ring">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <div className="small text-white-50">Login Type</div>
                            <div className="fw-semibold">{selectedRole.label}</div>
                          </div>
                          <button className="btn btn-sm btn-outline-light" onClick={handleBackToRole}><i className="bi bi-arrow-left" /> Change</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                          <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <div className="input-group">
                              <span className="input-group-text bg-transparent border-end-0"><i className="bi bi-envelope" /></span>
                              <input className="form-control form-control-lg border-start-0" id="email" type="email" name="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} autoComplete="email" required />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-group">
                              <span className="input-group-text bg-transparent border-end-0"><i className="bi bi-lock" /></span>
                              <input className="form-control form-control-lg border-start-0 border-end-0" id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} autoComplete="current-password" required />
                              <button type="button" className="btn btn-outline-light border-start-0" onClick={() => setShowPassword((value) => !value)}>
                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                              </button>
                            </div>
                          </div>

                            <div className="form-check mb-2">
                              <input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                              <label className="form-check-label small text-white-50" htmlFor="remember">Remember me</label>
                            </div>

                          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn btn-primary w-100 py-2 fw-semibold soft-btn" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing in...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-right-short me-2" />
                                Sign in as {selectedRole.label}
                              </>
                            )}
                          </motion.button>
                        </form>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <a href="#" className="small text-white-50">Forgot password?</a>
                          </div>
                          <div>
                            <small className="text-muted">Need access? Contact your administrator.</small>
                          </div>
                        </div>
                        <div className="text-center mt-3">
                          <small className="text-white-50">
                            Don&apos;t have an account? <Link to="/register" className="text-decoration-none text-white fw-bold">Register</Link>
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;