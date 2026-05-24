import { useEffect, useMemo, useState } from "react";
import { CheckCheck, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getQuickNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

function pick(notification, snake, camel) {
  return notification?.[snake] ?? notification?.[camel];
}

function relativeTime(value) {
  if (!value) return "";
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (diffSeconds < 60) return "Vừa xong";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function trimPreview(value) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  return compact.length > 80 ? `${compact.slice(0, 80)}...` : compact;
}

export function NotificationQuickPopup({ onClose, onChanged }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await getQuickNotifications();
      setItems(payload);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleItems = useMemo(
    () => (tab === "unread" ? items.filter((item) => pick(item, "is_read", "read") === false) : items),
    [items, tab]
  );

  const handleItemClick = async (item) => {
    try {
      await markNotificationAsRead(item.id);
      onChanged?.();
      onClose?.();
      navigate(`/notifications?id=${item.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      await load();
      onChanged?.();
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === "all" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-600"}`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setTab("unread")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === "unread" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-600"}`}
          >
            Chưa đọc
          </button>
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#1E3A8A]"
          aria-label="Đánh dấu tất cả đã đọc"
        >
          <CheckCheck className="h-4 w-4" />
        </button>
      </header>

      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center px-4 py-10 text-sm text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Đang tải...
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">Không có thông báo phù hợp</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visibleItems.slice(0, 10).map((item) => {
              const isRead = pick(item, "is_read", "read");
              const publishedAt = pick(item, "published_at", "publishedAt");
              const sender = pick(item, "created_by_display_name", "createdByDisplayName");
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isRead === false ? "bg-red-500" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      {sender ? <span className="mb-0.5 block truncate text-xs font-semibold text-[#1E3A8A]">{sender}</span> : null}
                      <span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">{trimPreview(item.preview)}</span>
                      <span className="mt-1 block text-xs font-medium text-slate-400">{relativeTime(publishedAt)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate("/notifications");
          }}
          className="w-full rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#172f70]"
        >
          Xem tất cả thông báo
        </button>
      </footer>
    </div>
  );
}
