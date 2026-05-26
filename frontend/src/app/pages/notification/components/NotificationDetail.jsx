import { useState } from "react";
import { X, CalendarClock, UserRound, AlertCircle, LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { replyToNotification } from "../../../../services/notificationService";

const typeLabel = {
  general: "Chung",
  academic: "Học vụ",
  tuition: "Học phí",
  exam: "Thi cử",
  system: "Hệ thống",
};

function pick(notification, snake, camel) {
  return notification?.[snake] ?? notification?.[camel];
}

function formatDate(value) {
  if (!value) return "Không có";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function NotificationDetail({ notification, onClose, onReplied }) {
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  if (!notification) return null;

  const type = pick(notification, "notification_type", "notificationType") || "general";
  const important = pick(notification, "is_important", "important");
  const publishedAt = pick(notification, "published_at", "publishedAt");
  const createdByName =
    pick(notification, "created_by_display_name", "createdByDisplayName") ||
    pick(notification, "created_by_name", "createdByName");
  const canReply = Boolean(pick(notification, "created_by", "createdBy")) && pick(notification, "is_read", "read") !== null;

  const handleReply = async (event) => {
    event.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    try {
      setSubmittingReply(true);
      await replyToNotification(notification.id, { content: replyContent.trim() });
      toast.success("Đã gửi phản hồi");
      setReplyContent("");
      onReplied?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {typeLabel[type] || "Chung"}
              </span>
              {important ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Quan trọng
                </span>
              ) : null}
            </div>
            <h2 className="break-words text-2xl font-semibold text-slate-900">{notification.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="mb-5 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              {formatDate(publishedAt)}
            </span>
            {createdByName ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <UserRound className="h-4 w-4" />
                {createdByName}
              </span>
            ) : null}
          </div>
          <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">{notification.content}</div>
          {canReply ? (
            <form onSubmit={handleReply} className="mt-6 border-t border-slate-200 pt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="notification-reply">
                Phản hồi
              </label>
              <textarea
                id="notification-reply"
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                rows={5}
                className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15"
                placeholder="Nhập nội dung phản hồi"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#172f70] disabled:opacity-60"
                >
                  {submittingReply ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Gửi phản hồi
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}
