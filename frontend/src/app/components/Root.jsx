import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarCheck,
  GraduationCap,
  DollarSign,
  FileText,
  Send,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Search,
  User,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useIdleLogout } from "../hooks/useIdleLogout";
import { NotificationBell } from "./NotificationBell";

const navigationByRole = {
  STUDENT: [
    { name: "Trang chủ", name_vi: "Tổng quan cá nhân", path: "", icon: LayoutDashboard },
    { name: "Thông báo", name_vi: "Tin tức và nhắc nhở", path: "/notifications", icon: Bell },
    { name: "Chương trình đào tạo", name_vi: "Lộ trình học tập", path: "curriculum", icon: BookOpen },
    { name: "Đăng ký môn học", name_vi: "Chọn lớp học phần", path: "course-registration", icon: ClipboardList },
    { name: "Thời khóa biểu tuần", name_vi: "Lịch học theo tuần", path: "schedule", icon: Calendar },
    { name: "Lịch thi", name_vi: "Kế hoạch thi cử", path: "exams", icon: CalendarCheck },
    { name: "Điểm số", name_vi: "Kết quả học tập", path: "grades", icon: GraduationCap },
    { name: "Học phí & Thanh toán", name_vi: "Theo dõi công nợ", path: "tuition", icon: DollarSign },
    { name: "Gửi yêu cầu", name_vi: "Nghỉ học hoặc phúc khảo", path: "submit-request", icon: Send },
    { name: "Phản hồi", name_vi: "Đóng góp ý kiến", path: "feedback", icon: MessageSquare },
  ],
  LECTURER: [
    { name: "Trang chủ", name_vi: "Bảng điều khiển giảng viên", path: "", icon: LayoutDashboard },
    { name: "Thông báo", name_vi: "Tin tức và nhắc nhở", path: "/notifications", icon: Bell },
    { name: "Lịch giảng dạy", name_vi: "Lịch dạy theo tuần", path: "schedule", icon: Calendar },
    { name: "Lịch coi thi", name_vi: "Kế hoạch coi thi cử", path: "exams", icon: CalendarCheck },
    { name: "Lớp học phần", name_vi: "Danh sách lớp phụ trách", path: "sections", icon: BookOpen },
    { name: "Nhập điểm", name_vi: "Cập nhật kết quả học tập", path: "grade-entry", icon: GraduationCap },
    { name: "Duyệt yêu cầu", name_vi: "Phê duyệt đơn từ", path: "request-approval", icon: CheckSquare },
    { name: "Phản hồi", name_vi: "Trao đổi với sinh viên", path: "feedback", icon: MessageSquare },
  ],
  ADMIN: [
    { name: "Trang chủ", name_vi: "Bảng điều khiển quản trị", path: "", icon: LayoutDashboard },
    { name: "Thông báo", name_vi: "Thông báo toàn hệ thống", path: "/notifications", icon: Bell },
    { name: "Sinh viên", name_vi: "Quản lý sinh viên", path: "students", icon: User },
    { name: "Giảng viên", name_vi: "Quản lý giảng viên", path: "lecturers", icon: User },
    { name: "Môn học", name_vi: "Quản lý danh mục môn học", path: "courses", icon: BookOpen },
    { name: "Phân công lớp học phần", name_vi: "Gán giảng viên cho lớp", path: "section-assignment", icon: BookOpen },
    { name: "Phiên đăng ký môn", name_vi: "Mở/đóng đăng ký học phần", path: "registration-sessions", icon: CalendarCheck },
    { name: "Thời khóa biểu", name_vi: "Tạo và quản lý lịch học", path: "timetable", icon: CalendarDays },
    { name: "Quản lý lịch thi", name_vi: "Xếp lịch & gán giám thị", path: "exams", icon: CalendarCheck },
  ],
};

export function Root() {
  useIdleLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const roleBasePath = {
    STUDENT: "/portal/student",
    LECTURER: "/portal/lecturer",
    ADMIN: "/portal/admin",
  };

  const basePath = roleBasePath[user?.role] || roleBasePath.STUDENT;
  const navigation = (navigationByRole[user?.role] || navigationByRole.STUDENT).map((item) => ({
    ...item,
    href: item.path ? (item.path.startsWith("/") ? item.path : `${basePath}/${item.path}`) : basePath,
  }));

  const handleLogout = () => {
    logout();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const portalTitleByRole = {
    STUDENT: "Cổng thông tin sinh viên",
    LECTURER: "Cổng thông tin giảng viên",
    ADMIN: "Cổng thông tin quản trị",
  };

  const portalSubtitleByRole = {
    STUDENT: "Bảng điều khiển sinh viên",
    LECTURER: "Bảng điều khiển giảng viên",
    ADMIN: "Bảng điều khiển quản trị",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {portalTitleByRole[user?.role] || portalTitleByRole.STUDENT}
                </h1>
                <p className="text-xs text-gray-500">
                  {portalSubtitleByRole[user?.role] || portalSubtitleByRole.STUDENT}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm môn học, thông báo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.username || "Người dùng"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role ? `Vai trò: ${user.role}` : "Đang đăng nhập"}
                </p>
              </div>
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-[73px] bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-20 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== basePath && location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? "bg-[#1E3A8A] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className={`text-xs truncate ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                      {item.name_vi}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
