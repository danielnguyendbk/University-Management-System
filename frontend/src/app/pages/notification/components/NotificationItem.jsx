import { Bell, BookOpen, CalendarClock, ClipboardList, DollarSign, Settings, UserRound } from "lucide-react";

const typeMeta = {
  general: { label: "Chung", className: "bg-slate-100 text-slate-700", icon: Bell },
  academic: { label: "Học vụ", className: "bg-blue-50 text-blue-700", icon: BookOpen },
  tuition: { label: "Học phí", className: "bg-emerald-50 text-emerald-700", icon: DollarSign },
  exam: { label: "Thi cử", className: "bg-amber-50 text-amber-700", icon: ClipboardList },
  system: { label: "Hệ thống", className: "bg-violet-50 text-violet-700", icon: Settings },
};

function pick(notification, snake, camel) {
  return notification?.[snake] ?? notification?.[camel];
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getPreview(content) {
  const compact = String(content || "").replace(/\s+/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 140)}...` : compact;
}

export function NotificationItem({ notification, onClick, actions }) {
  const type = pick(notification, "notification_type", "notificationType") || "general";
  const meta = typeMeta[type] || typeMeta.general;
  const Icon = meta.icon;
  const isRead = pick(notification, "is_read", "read");
  const important = pick(notification, "is_important", "important");
  const publishedAt = pick(notification, "published_at", "publishedAt");
  const sender =
    pick(notification, "created_by_display_name", "createdByDisplayName") ||
    pick(notification, "created_by_name", "createdByName");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`relative rounded-lg border p-4 shadow-sm transition hover:border-[#1E3A8A]/30 hover:shadow-md ${
        isRead === false ? "border-blue-100 bg-blue-50/70" : "border-gray-200 bg-white"
      }`}
    >
      {isRead === false ? <span className="absolute left-0 top-5 h-9 w-1 rounded-r-full bg-[#1E3A8A]" /> : null}
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {sender ? (
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                  <UserRound className="h-3.5 w-3.5" />
                  {sender}
                </p>
              ) : null}
              <h3 className="break-words text-base font-semibold text-slate-900">{notification.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{getPreview(notification.content || notification.preview)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {important ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Quan trọng</span> : null}
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <time className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarClock className="h-4 w-4" />
              {formatDate(publishedAt)}
            </time>
            {actions ? <div onClick={(event) => event.stopPropagation()}>{actions}</div> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
