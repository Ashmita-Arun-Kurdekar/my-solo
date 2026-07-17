import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const homeForRole = (role) => (Number(role) === 1 ? "/admin" : Number(role) === 2 ? "/manager" : "/employee");

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.map(Number).includes(Number(user?.role))) {
    return <Navigate to={homeForRole(user?.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
