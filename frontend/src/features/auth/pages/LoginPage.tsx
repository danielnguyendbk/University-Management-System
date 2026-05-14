import { AlertCircle, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROLE_CREDENTIALS } from "../constants/credentials";
import { useAuth } from "../hooks/useAuth";
import { useLoginForm } from "../hooks/useLoginForm";

const getRoleRedirect = (email: string) => {
  if (email.includes("lecturer") || email.includes("gv")) return APP_ROUTES.lecturerDashboard;
  if (email.includes("employee") || email.includes("nv")) return APP_ROUTES.employeeDashboard;
  if (email.includes("student") || email.includes("sv")) return APP_ROUTES.studentDashboard;
  if (email.includes("staff")) return APP_ROUTES.staffDashboard;
  return APP_ROUTES.home;
};

export const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    setLoading,
    error,
    setError,
    fillCredential,
  } = useLoginForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(getRoleRedirect(email));
    } catch {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="w-full max-w-4xl relative flex gap-6">
        <div className="hidden lg:flex flex-col justify-center flex-1 text-white pr-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Hệ thống Quản lý</h1>
          <h2 className="text-2xl font-semibold text-blue-200 mb-4">Phòng học & Thời khóa biểu</h2>
          <p className="text-blue-200 leading-relaxed">
            Nền tảng quản lý phân công phòng học, thời khóa biểu và lịch học cho toàn bộ trường đại học,
            tích hợp đa vai trò, thời gian thực và thân thiện người dùng.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {["48 Phòng học", "156 Môn học", "892 Tiết học/tuần", "5 Vai trò"].map((item) => (
              <div key={item} className="bg-white/10 rounded-xl p-3 backdrop-blur">
                <p className="text-sm font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[420px] bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 lg:hidden">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center">Đăng nhập hệ thống</h1>
            <p className="text-sm text-gray-500 mt-1">CSMS — University Scheduling System</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Tài khoản email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@university.edu.vn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center font-medium uppercase tracking-wide">
              Tài khoản demo — click để điền
            </p>
            <div className="space-y-1.5">
              {ROLE_CREDENTIALS.map((credential) => (
                <button
                  key={credential.role}
                  onClick={() => fillCredential(credential)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-colors group"
                >
                  <div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded mr-2">
                      {credential.role}
                    </span>
                    <span className="text-xs text-gray-500">{credential.hint}</span>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-blue-500 truncate max-w-[140px]">
                    {credential.email}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Mật khẩu: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
