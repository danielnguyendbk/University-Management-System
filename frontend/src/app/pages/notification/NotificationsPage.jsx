import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { NotificationList } from "./components/NotificationList";
import { SendNotificationForm } from "./components/SendNotificationForm";

export function NotificationsPage() {
  const [tab, setTab] = useState("view");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Thông báo"
        subtitle="Theo dõi thông báo đã nhận và gửi thông tin đến đúng đối tượng trong cổng thông tin."
      />

      <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setTab("view")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
              tab === "view" ? "bg-[#1E3A8A] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell className="h-4 w-4" />
            Xem thông báo
          </button>
          <button
            type="button"
            onClick={() => setTab("send")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
              tab === "send" ? "bg-[#1E3A8A] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Send className="h-4 w-4" />
            Gửi thông báo
          </button>
        </div>
      </div>

      {tab === "view" ? <NotificationList /> : <SendNotificationForm />}
    </div>
  );
}
