import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const rolePath = {
  STUDENT: "/portal/student",
  LECTURER: "/portal/lecturer",
  ADMIN: "/portal/admin",
};

export function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={rolePath[user.role] || "/"} replace />;
  }

  return children;
}