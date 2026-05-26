import { useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../../hooks/useAuth";
import { changePassword } from "../../../services/authService";

export function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setSuccess("Mật khẩu đã được đổi thành công. Bạn nên đăng nhập lại nếu cần.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const passwordFieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Đổi mật khẩu"
        subtitle={`Cập nhật mật khẩu cho tài khoản ${user?.username || "đang đăng nhập"}`}
      />

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={`${passwordFieldClass} pl-10`}
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showCurrent ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={`${passwordFieldClass} pl-10`}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showNew ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`${passwordFieldClass} pl-10`}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163170] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Đổi mật khẩu
          </button>
        </form>

        <aside className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            Bảo mật
          </div>
          <h3 className="text-xl font-semibold">Mẹo đặt mật khẩu an toàn</h3>
          <ul className="space-y-3 text-sm text-slate-200 leading-6 list-disc pl-5">
            <li>Dùng tối thiểu 6 ký tự, nên kết hợp chữ, số và ký tự đặc biệt.</li>
            <li>Không dùng lại mật khẩu cũ hoặc mật khẩu dễ đoán.</li>
            <li>Sau khi đổi mật khẩu, đăng xuất và đăng nhập lại nếu thấy cần thiết.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}