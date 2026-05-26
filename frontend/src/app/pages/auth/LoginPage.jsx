import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AlertCircle, LoaderCircle, UserRound, LockKeyhole, GraduationCap } from "lucide-react";
import { Calendar, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const { login, user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("D22KH002");
  const [password, setPassword] = useState("thai06112005");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getPortalPathByRole = (role) => {
    if (role === "STUDENT") return "/portal/student";
    if (role === "LECTURER") return "/portal/lecturer";
    if (role === "ADMIN") return "/portal/admin";
    return "/portal";
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.forcePasswordChange ? "/change-password" : getPortalPathByRole(user.role), { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login({ username: username.trim(), password });
      navigate(loggedInUser?.forcePasswordChange ? "/change-password" : getPortalPathByRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #f0f4ff 0%, #e0e7ff 30%, #c7d2fe 60%, #ddd6fe 100%)" }}>
      {/* Header */}
      <header className="w-full" style={{ background: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(99,102,241,0.1)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4f46e5, #4338ca)" }}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-lg tracking-wide">Cổng thông tin sinh viên - giảng viên</h1>
            <p className="text-xs text-slate-400">Hệ thống quản lý đào tạo</p>
          </div>
        </div>
      </header>

      {/* Centered Login */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(79,70,229,0.12), 0 0 0 1px rgba(99,102,241,0.08)",
            }}
          >
            {/* Gradient accent bar */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #6366f1, #4f46e5, #818cf8)" }} />

            <div className="p-8 sm:p-10">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}>
                  <LockKeyhole className="w-7 h-7" style={{ color: "#4f46e5" }} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
                <p className="mt-2 text-sm text-slate-500">Nhập tài khoản để truy cập hệ thống</p>
              </div>

              {message ? (
                <div className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              ) : null}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập</label>
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200"
                    style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <UserRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="Nhập tên đăng nhập"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200"
                    style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <LockKeyhole className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="mt-2 text-right">
                    <button type="button" className="text-xs font-medium transition-colors duration-200 hover:underline" style={{ color: "#6366f1" }}>
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                    boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.45)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; }}
                >
                  {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <div className="mt-6 rounded-xl border px-4 py-3 text-sm text-slate-600" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                Tài khoản test: <strong>D22KH002 / thai06112005</strong>, <strong>GV002 / Thai06112005</strong>, <strong>admin01 / 123456</strong>
              </div>
            </div>
          </div>

          {/* Footer text */}
          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Hệ thống quản lý đào tạo. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
