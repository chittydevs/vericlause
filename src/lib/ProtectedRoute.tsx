import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

type ProtectedRouteProps = {
  allowedRoles?: Array<"admin" | "user">;
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Authenticated but not allowed – send to dashboard by default
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

