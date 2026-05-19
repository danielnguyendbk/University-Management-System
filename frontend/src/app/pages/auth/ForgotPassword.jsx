import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, LoaderCircle } from "lucide-react";
import { forgotPassword, verifyForgotPasswordOtp } from "../../../services/authService";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("request");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await forgotPassword({ email });
      setStep("verify");
      setMessage("Mã OTP đã được gửi vào email. Vui lòng nhập mã để tiếp tục.");
    } catch (err) {
      setError(err.message || "Không thể gửi OTP đặt lại mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const resetToken = await verifyForgotPasswordOtp({ email, otp });
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`, { replace: true });
    } catch (err) {
      setError(err.message || "OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-3">Quên mật khẩu</h2>
      <p className="text-sm text-gray-600 mb-4">
        {step === "request"
          ? "Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu."
          : "Nhập mã OTP đã gửi vào email để chuyển sang bước đặt mật khẩu mới."}
      </p>

      {message ? (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">{message}</div>
      ) : null}

      {error ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">{error}</div>
      ) : null}

      <form onSubmit={step === "request" ? handleRequestOtp : handleVerifyOtp} className="mt-4 space-y-4">
        <label className="block text-sm">Email</label>
        <div className="flex items-center gap-3 border rounded-lg px-3 py-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full outline-none"
            placeholder="you@example.com"
            disabled={step === "verify"}
          />
        </div>

        {step === "verify" ? (
          <div>
            <label className="block text-sm">Mã OTP (6 số)</label>
            <input
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full border rounded-lg px-3 py-2 outline-none"
              placeholder="Nhập mã OTP"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] text-white px-4 py-2"
        >
          {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
          {step === "request" ? "Gửi OTP" : "Xác thực OTP"}
        </button>
      </form>
    </div>
  );
}
