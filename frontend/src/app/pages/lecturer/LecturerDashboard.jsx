import { Calendar, BookOpen, CheckSquare, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { useAuth } from "../../../hooks/useAuth";

const todaySchedule = [
  { id: 1, time: "07:30", course: "Cơ sở dữ liệu", section: "DB202", room: "B-205" },
  { id: 2, time: "10:00", course: "Phát triển web", section: "WEB301", room: "C-104" },
  { id: 3, time: "13:30", course: "Cấu trúc dữ liệu", section: "DS201", room: "A-301" },
];

const sectionSummary = [
  { id: 1, section: "DB202", students: 42, status: "Đang mở" },
  { id: 2, section: "WEB301", students: 35, status: "Đang mở" },
  { id: 3, section: "DS201", students: 38, status: "Sắp khóa" },
];

export function LecturerDashboard() {
  const { user } = useAuth();
  const lecturerProfile = user?.lecturerProfile;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Trang chủ giảng viên"
        subtitle={`Xin chào, ${user?.fullName || user?.username || "giảng viên"}. Đây là tổng quan nhanh về lịch dạy, lớp phụ trách và các yêu cầu chờ xử lý.`}
      />

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Lecturer information">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin giảng viên</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Họ và tên</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{lecturerProfile?.fullName || user?.fullName || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Mã giảng viên</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{lecturerProfile?.lecturerCode || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Vai trò</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{user?.role || "LECTURER"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Email làm việc</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{lecturerProfile?.workEmail || user?.email || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Số điện thoại</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{lecturerProfile?.phone || "-"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Học hàm / Học vị</p>
            <p className="mt-1 text-base font-semibold text-gray-900">{lecturerProfile?.academicTitle || "-"}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Lớp phụ trách" value="3" note="2 lớp đang mở" icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="Tiết dạy hôm nay" value="3" note="Từ 07:30 đến 13:30" icon={<Calendar className="w-5 h-5" />} />
        <StatCard label="Yêu cầu chờ duyệt" value="3" note="1 phúc khảo, 2 xin nghỉ" icon={<CheckSquare className="w-5 h-5" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lịch dạy hôm nay</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{item.course}</p>
                  <p className="text-sm text-slate-600">{item.section} • Phòng {item.room}</p>
                </div>
                <span className="text-sm font-semibold text-[#1E3A8A]">{item.time}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lớp đang phụ trách</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {sectionSummary.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{item.section}</p>
                  <p className="text-sm text-slate-600">{item.students} sinh viên</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">{item.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
