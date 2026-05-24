import { useEffect, useState } from "react";
import { Archive, CheckCircle2, LoaderCircle, Users, X } from "lucide-react";
import { toast } from "sonner";
import { archiveNotification, getNotificationStats } from "../../../../services/notificationService";

function readStat(stats, snake, camel) {
  return Number(stats?.[snake] ?? stats?.[camel] ?? 0);
}

export function NotificationStats({ notification, onClose, onArchived }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (!notification?.id) return;
    let mounted = true;
    setLoading(true);
    getNotificationStats(notification.id)
      .then((payload) => mounted && setStats(payload))
      .catch((error) => toast.error(error.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [notification?.id]);

  if (!notification) return null;

  const total = readStat(stats, "total_recipients", "totalRecipients");
  const read = readStat(stats, "read_count", "readCount");
  const unread = readStat(stats, "unread_count", "unreadCount");
  const readRate = total > 0 ? Math.round((read / total) * 100) : 0;

  const handleArchive = async () => {
    try {
      setArchiving(true);
      await archiveNotification(notification.id);
      toast.success("Đã lưu trữ thông báo");
      onArchived?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <section className="w-full max-w-xl rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1E3A8A]">Thống kê</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{notification.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Đang tải thống kê...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <Users className="mb-2 h-5 w-5 text-[#1E3A8A]" />
                  <p className="text-2xl font-semibold text-slate-900">{total}</p>
                  <p className="text-sm text-slate-500">Người nhận</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-700" />
                  <p className="text-2xl font-semibold text-emerald-800">{read}</p>
                  <p className="text-sm text-emerald-700">Đã đọc</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="mb-2 h-5 w-5 rounded-full bg-amber-500" />
                  <p className="text-2xl font-semibold text-amber-800">{unread}</p>
                  <p className="text-sm text-amber-700">Chưa đọc</p>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Tỷ lệ đã đọc</span>
                  <span className="font-semibold text-slate-900">{readRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#1E3A8A]" style={{ width: `${readRate}%` }} />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Đóng
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={archiving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#172f70] disabled:opacity-60"
            >
              {archiving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Lưu trữ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
