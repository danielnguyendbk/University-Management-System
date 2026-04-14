import { BookOpen, TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";

const upcomingClasses = [
  { id: 1, course: "Cấu trúc dữ liệu và giải thuật", time: "09:00", room: "A-301", lecturer: "TS. Smith" },
  { id: 2, course: "Hệ quản trị cơ sở dữ liệu", time: "11:00", room: "B-205", lecturer: "PGS. Johnson" },
  { id: 3, course: "Phát triển web", time: "14:00", room: "C-104", lecturer: "TS. Williams" },
];

const recentAnnouncements = [
  { id: 1, title: "Mở đăng ký học kỳ Xuân", date: "20/03/2026", important: true },
  { id: 2, title: "Kéo dài giờ mở cửa thư viện", date: "18/03/2026", important: false },
  { id: 3, title: "Ngày hội việc làm - 04/2026", date: "15/03/2026", important: true },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Trang chủ" subtitle="Chào mừng quay lại, John Doe" />

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Student profile">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hồ sơ sinh viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
            <p className="font-medium text-gray-900">John Doe</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Mã sinh viên</p>
            <p className="font-medium text-gray-900">2021001234</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Chương trình</p>
            <p className="font-medium text-gray-900">Công nghệ thông tin - Cử nhân</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tình trạng học tập</p>
            <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              Đang học
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Quick statistics">
        <StatCard
          label="Môn học hiện tại"
          value="6"
          note="18 tín chỉ"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="GPA hiện tại"
          value="3.75"
          note="+0.12 so với học kỳ trước"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Tình trạng học phí"
          value="$4,500"
          note="Quá hạn"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Schedule and announcements">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lịch học hôm nay</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-sm font-semibold text-[#1E3A8A]">{cls.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">{cls.course}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Phòng: {cls.room}</span>
                    <span>•</span>
                    <span>{cls.lecturer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#1E3A8A] font-medium hover:bg-blue-50 rounded-lg transition-colors">
            Xem toàn bộ thời khóa biểu →
          </button>
        </article>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thông báo gần đây</h2>
            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">
              3 mới
            </span>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border ${
                  announcement.important
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {announcement.important && (
                    <AlertCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {announcement.title}
                    </p>
                    <p className="text-xs text-gray-500">{announcement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#1E3A8A] font-medium hover:bg-blue-50 rounded-lg transition-colors">
            Xem tất cả thông báo →
          </button>
        </article>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Quick actions">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <BookOpen className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Đăng ký môn học</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <DollarSign className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Thanh toán học phí</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <Clock className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Xem thời khóa biểu</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <TrendingUp className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Xem điểm</p>
          </button>
        </div>
      </section>
    </div>
  );
}
