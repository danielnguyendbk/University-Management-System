import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { getAvailableTargets, sendNotification } from "../../../../services/notificationService";

const typeOptions = [
  { value: "general", label: "Chung" },
  { value: "academic", label: "Học vụ" },
  { value: "tuition", label: "Học phí" },
  { value: "exam", label: "Thi cử" },
  { value: "system", label: "Hệ thống" },
];

function pick(target, snake, camel) {
  return target?.[snake] ?? target?.[camel];
}

export function SendNotificationForm() {
  const [targets, setTargets] = useState([]);
  const [targetValue, setTargetValue] = useState("");
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    notification_type: "general",
    is_important: false,
  });

  const selectedTarget = useMemo(
    () => targets.find((target) => target.value === targetValue),
    [targetValue, targets]
  );

  const hasRecipients = (target) => Number(pick(target, "recipient_estimate", "recipientEstimate") || 0) > 0;

  const loadTargets = async () => {
    setLoadingTargets(true);
    try {
      const payload = await getAvailableTargets();
      const visibleTargets = payload.filter(hasRecipients);
      setTargets(visibleTargets);
      setTargetValue((current) => (visibleTargets.some((item) => item.value === current) ? current : visibleTargets[0]?.value || ""));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingTargets(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTarget) {
      toast.error("Vui lòng chọn đối tượng nhận");
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Tiêu đề và nội dung là bắt buộc");
      return;
    }

    const body = {
      title: form.title.trim(),
      content: form.content.trim(),
      notification_type: form.notification_type,
      is_important: form.is_important,
      target_type: pick(selectedTarget, "target_type", "targetType") || selectedTarget.type,
      target_ids: pick(selectedTarget, "target_ids", "targetIds") || [],
    };

    try {
      setSubmitting(true);
      await sendNotification(body);
      toast.success("Đã gửi thông báo");
      setForm({
        title: "",
        content: "",
        notification_type: "general",
        is_important: false,
      });
      await loadTargets();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="notification-title">
              Tiêu đề
            </label>
            <input
              id="notification-title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              maxLength={150}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15"
              placeholder="Nhập tiêu đề thông báo"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="notification-content">
              Nội dung
            </label>
            <textarea
              id="notification-content"
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              rows={9}
              className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15"
              placeholder="Nhập nội dung chi tiết"
              required
            />
          </div>
        </div>

        <aside className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="notification-type">
              Loại thông báo
            </label>
            <select
              id="notification-type"
              value={form.notification_type}
              onChange={(event) => updateField("notification_type", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1E3A8A]"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="notification-target">
                Gửi đến
              </label>
              <button
                type="button"
                onClick={loadTargets}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-[#1E3A8A]"
                aria-label="Tải lại đối tượng nhận"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <select
              id="notification-target"
              value={targetValue}
              disabled={loadingTargets || targets.length === 0}
              onChange={(event) => setTargetValue(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1E3A8A] disabled:bg-slate-100"
            >
              {loadingTargets ? <option>Đang tải...</option> : null}
              {!loadingTargets && targets.length === 0 ? <option>Không có đối tượng phù hợp</option> : null}
              {targets.map((target) => (
                <option key={target.value} value={target.value}>
                  {target.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.is_important}
              onChange={(event) => updateField("is_important", event.target.checked)}
              className="h-4 w-4 accent-[#1E3A8A]"
            />
            Quan trọng
          </label>

          <button
            type="submit"
            disabled={submitting || loadingTargets || !selectedTarget}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 text-sm font-semibold text-white transition hover:bg-[#172f70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gửi thông báo
          </button>
        </aside>
      </div>
    </form>
  );
}
