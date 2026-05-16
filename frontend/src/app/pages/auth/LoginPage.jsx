import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, AlertCircle, LoaderCircle, ShieldCheck, UserRound, LockKeyhole } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";


export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("n23dccn001");
  const [password, setPassword] = useState("123456");
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
      navigate(getPortalPathByRole(user.role), { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login({ username, password });
      navigate(getPortalPathByRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Cổng thông tin sinh viên</h1>
              <p className="text-xs text-gray-500">Hệ thống thông tin sinh viên</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <section className="space-y-6">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 bg-blue-50 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                Authentication connected
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900 leading-tight">
                Cổng thông tin sinh viên - giảng viên
              </h2>
              <p className="mt-4 text-slate-600 text-lg leading-8">
                Đăng nhập bằng tài khoản đã seed để kiểm tra JWT, gọi `/api/auth/me`, rồi chuyển thẳng vào portal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Test account</p>
                <p className="mt-2 font-semibold text-slate-900">student01</p>
                <p className="text-sm text-slate-600">Password: 123456</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Role test</p>
                <p className="mt-2 font-semibold text-slate-900">STUDENT / LECTURER / ADMIN</p>
                <p className="text-sm text-slate-600">JWT + RBAC</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-5 shadow-sm">
                <p className="text-sm text-slate-500">Next step</p>
                <p className="mt-2 font-semibold text-slate-900">/api/auth/me</p>
                <p className="text-sm text-slate-600">Load current user</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Thông báo nhanh</h3>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="font-medium text-slate-900">{announcement.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{announcement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:sticky lg:top-8">
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-8">
              <div className="mb-6">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  <UserRound className="w-4 h-4" />
                  Đăng nhập hệ thống
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">Dùng tài khoản test để vào portal</h3>
                <p className="mt-2 text-slate-600">JWT sẽ được lưu localStorage và tự gọi `/api/auth/me`.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                    <UserRound className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                      placeholder="student01"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                    <LockKeyhole className="w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                      placeholder="123456"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1E3A8A]/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                Tài khoản test: <strong>n23dccn001 / 123456</strong>, <strong>gv001 / 123456</strong>, <strong>admin / 123456</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
