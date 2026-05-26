import { BookOpen, CalendarCheck, Users, UserRound } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { useAuth } from "../../../hooks/useAuth";

const quickTasks = [
  { id: 1, title: "Mở phiên đăng ký", description: "Tạo phiên đăng ký cho sinh viên theo học kỳ." },
  { id: 2, title: "Phân công giảng viên", description: "Gán giảng viên cho lớp học phần phù hợp." },
  { id: 3, title: "Quản lý tài khoản", description: "Khóa/mở tài khoản sinh viên hoặc giảng viên." },
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Trang chủ quản trị"
        subtitle={`Xin chào, ${user?.fullName || user?.username || "quản trị viên"}. Đây là nơi điều phối các tác vụ hệ thống quan trọng.`}
      />

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Admin information">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserRound className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin quản trị viên</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Họ và tên</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{user?.fullName || user?.username || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Tên đăng nhập</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{user?.username || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{user?.email || "-"}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Sinh viên" value="1,248" note="12 tài khoản chờ duyệt" icon={<Users className="w-5 h-5" />} />
        <StatCard label="Giảng viên" value="86" note="4 tài khoản mới" icon={<UserRound className="w-5 h-5" />} />
        <StatCard label="Lớp học phần" value="214" note="36 lớp mở kỳ này" icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="Phiên đăng ký" value="2" note="1 đang mở, 1 sắp mở" icon={<CalendarCheck className="w-5 h-5" />} />
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tác vụ nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickTasks.map((task) => (
            <div key={task.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{task.title}</p>
              <p className="text-sm text-slate-600 mt-1">{task.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}