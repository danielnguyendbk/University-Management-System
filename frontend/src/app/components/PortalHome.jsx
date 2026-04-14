import { LayoutDashboard, Bell, CheckSquare, MessageSquare, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Dashboard } from "../pages/student/Dashboard";

function RoleLanding({ title, description, actions, accentIcon }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            {accentIcon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-600 leading-7">{description}</p>
          </div>
        </div>

        {actions ? <div className="mt-6 grid gap-3 md:grid-cols-2">{actions}</div> : null}
      </section>
    </div>
  );
}

function ActionCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
          {icon}
        </div>
        <div>
          <p className="font-medium text-slate-900">{title}</p>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function PortalHome() {
  const { user } = useAuth();

  if (user?.role === "LECTURER") {
    return (
      <RoleLanding
        title={`Chào mừng giảng viên ${user?.fullName || user?.username}`}
        description="Khu vực này sẽ tập trung vào lịch giảng dạy, danh sách lớp học phần và duyệt yêu cầu của sinh viên. Hiện tại bạn đã có thể dùng menu để đi tới các phần đã kết nối sẵn."
        accentIcon={<ShieldCheck className="w-6 h-6" />}
        actions={[
          <ActionCard key="1" icon={<CheckSquare className="w-5 h-5" />} title="Duyệt yêu cầu" description="Xem các đơn phúc khảo hoặc xin nghỉ học." />,
          <ActionCard key="2" icon={<MessageSquare className="w-5 h-5" />} title="Phản hồi" description="Trao đổi với sinh viên nhanh chóng." />,
        ]}
      />
    );
  }

  if (user?.role === "ADMIN") {
    return (
      <RoleLanding
        title={`Chào mừng quản trị viên ${user?.fullName || user?.username}`}
        description="Dashboard quản trị sẽ dùng để quản lý người dùng, môn học, học phí và cấu hình hệ thống. Phần này hiện đang ở giai đoạn khởi tạo, nhưng routing và auth đã sẵn sàng." 
        accentIcon={<ShieldCheck className="w-6 h-6" />}
        actions={[
          <ActionCard key="1" icon={<UserRound className="w-5 h-5" />} title="Người dùng" description="Quản lý sinh viên, giảng viên và tài khoản." />,
          <ActionCard key="2" icon={<Bell className="w-5 h-5" />} title="Thông báo hệ thống" description="Gửi thông báo toàn trường." />,
        ]}
      />
    );
  }

  return <Dashboard />;
}