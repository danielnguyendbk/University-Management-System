import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, loading, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !user.forcePasswordChange) {
      const rolePath = user.role === "STUDENT" ? "/portal/student" : user.role === "LECTURER" ? "/portal/lecturer" : "/portal/admin";
      navigate(rolePath, { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setSubmitting(true);
      const updatedUser = await changePassword({ currentPassword, newPassword, confirmPassword });
      const rolePath = updatedUser?.role === "STUDENT" ? "/portal/student" : updatedUser?.role === "LECTURER" ? "/portal/lecturer" : "/portal/admin";
      toast.success("Đã đổi mật khẩu thành công");
      navigate(rolePath, { replace: true });
    } catch (error) {
      toast.error(error.message || "Không thể đổi mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_40%),linear-gradient(180deg,_#eff6ff_0%,_#ffffff_45%,_#dbeafe_100%)] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-blue-100 bg-white/90 shadow-[0_30px_90px_rgba(37,99,235,0.18)] backdrop-blur overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#60A5FA]" />
        <div className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Yêu cầu đổi mật khẩu
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Tài khoản của bạn cần đặt mật khẩu mới</h1>
            <p className="text-slate-600 leading-7">
              Đây là lần đăng nhập đầu tiên hoặc tài khoản vừa được khởi tạo lại. Hãy đổi mật khẩu để tiếp tục vào hệ thống.
            </p>
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900">
              Sau khi đổi mật khẩu, bạn sẽ được chuyển về đúng portal theo vai trò của mình.
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Mật khẩu hiện tại"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1E3A8A]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
