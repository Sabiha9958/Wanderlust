import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ---------------- LOADER ---------------- */

const FullScreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
  </div>
);

/* ---------------- COMPONENT ---------------- */

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  /* -------- Loading State -------- */
  if (loading) return <FullScreenLoader />;

  /* -------- Not Logged In -------- */
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  /* -------- Role Check -------- */
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  /* -------- Render -------- */
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
