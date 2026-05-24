import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../../services/notificationService";
import { NotificationQuickPopup } from "./NotificationQuickPopup";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const wrapperRef = useRef(null);

  const loadUnread = async () => {
    try {
      const count = await getUnreadCount();
      setUnread(count);
    } catch {
      setUnread(0);
    }
  };

  useEffect(() => {
    loadUnread();
    const timer = window.setInterval(loadUnread, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const badge = unread > 99 ? "99+" : unread;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg p-2 transition hover:bg-gray-100"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </button>
      {open ? <NotificationQuickPopup onClose={() => setOpen(false)} onChanged={loadUnread} /> : null}
    </div>
  );
}
