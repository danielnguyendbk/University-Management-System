import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Key, LoaderCircle } from "lucide-react";
import { resetPassword } from "../../../services/authService";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword, confirmPassword });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Không thể đặt lại mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-3">Đặt lại mật khẩu</h2>
      {error ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 mb-3">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Mật khẩu mới</label>
          <div className="flex items-center gap-3 border rounded-lg px-3 py-2">
            <Key className="w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm">Xác nhận mật khẩu</label>
          <div className="flex items-center gap-3 border rounded-lg px-3 py-2">
            <Key className="w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] text-white px-4 py-2"
        >
          {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
}
