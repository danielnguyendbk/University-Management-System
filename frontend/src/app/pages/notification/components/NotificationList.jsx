import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCheck, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import {
  getNotification,
  listMyNotifications,
  listSentNotifications,
  markAllNotificationsAsRead,
} from "../../../../services/notificationService";
import { NotificationDetail } from "./NotificationDetail";
import { NotificationItem } from "./NotificationItem";
import { NotificationStats } from "./NotificationStats";

const typeOptions = [
  { value: "", label: "Tất cả loại" },
  { value: "general", label: "Chung" },
  { value: "academic", label: "Học vụ" },
  { value: "tuition", label: "Học phí" },
  { value: "exam", label: "Thi cử" },
  { value: "system", label: "Hệ thống" },
];

function normalizePage(payload, size) {
  return payload?.content
    ? payload
    : { content: [], totalElements: 0, totalPages: 0, page: 0, size };
}

export function NotificationList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState("received");
  const [type, setType] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [pageData, setPageData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [statsNotification, setStatsNotification] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload =
        mode === "sent"
          ? await listSentNotifications({ page, size })
          : await listMyNotifications({ page, size, type, isRead: unreadOnly ? false : undefined });
      setPageData(normalizePage(payload, size));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [mode, page, size, type, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    getNotification(id)
      .then((payload) => {
        setDetail(payload);
        load();
      })
      .catch((error) => toast.error(error.message));
  }, [searchParams, load]);

  const rows = pageData.content || [];
  const totalPages = Math.max(Number(pageData.totalPages || 0), 1);

  const rangeLabel = useMemo(() => {
    const total = Number(pageData.totalElements || 0);
    if (!total) return "0 thông báo";
    const start = page * size + 1;
    const end = Math.min(start + rows.length - 1, total);
    return `${start}-${end} trong ${total}`;
  }, [page, pageData.totalElements, rows.length, size]);

  const handleOpen = async (notification) => {
    try {
      const payload = await getNotification(notification.id);
      setDetail(payload);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success("Đã đánh dấu tất cả là đã đọc");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    if (searchParams.get("id")) {
      setSearchParams({});
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("received");
                    setPage(0);
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "received" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-600"}`}
                >
                  Đã nhận
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("sent");
                    setPage(0);
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "sent" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-600"}`}
                >
                  Đã gửi
                </button>
              </div>
            ) : null}

            {mode === "received" ? (
              <>
                <select
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#1E3A8A]"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(event) => {
                      setUnreadOnly(event.target.checked);
                      setPage(0);
                    }}
                    className="h-4 w-4 accent-[#1E3A8A]"
                  />
                  Chưa đọc
                </label>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </button>
            {mode === "received" ? (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-3 text-sm font-semibold text-white hover:bg-[#172f70]"
              >
                <CheckCheck className="h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-500">
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
          Đang tải thông báo...
        </div>
      ) : rows.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-center text-slate-500">
          <Search className="mb-3 h-8 w-8 text-slate-400" />
          <p className="font-semibold text-slate-700">Chưa có thông báo phù hợp</p>
          <p className="mt-1 text-sm">Thử đổi bộ lọc hoặc tải lại danh sách.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleOpen(notification)}
              actions={
                mode === "sent" && isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setStatsNotification(notification)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50"
                  >
                    Thống kê
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
        <span>{rangeLabel}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <span className="min-w-24 text-center font-semibold text-slate-800">
            Trang {page + 1}/{totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      <NotificationDetail notification={detail} onClose={closeDetail} onReplied={load} />
      <NotificationStats notification={statsNotification} onClose={() => setStatsNotification(null)} onArchived={load} />
    </section>
  );
}
