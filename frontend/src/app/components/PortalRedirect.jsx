import { Navigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const rolePath = {
  STUDENT: "/portal/student",
  LECTURER: "/portal/lecturer",
  ADMIN: "/portal/admin",
};

export function PortalRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-2">
          <LoaderCircle className="w-5 h-5 animate-spin" />
          <span>Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={rolePath[user.role] || "/"} replace />;
}
