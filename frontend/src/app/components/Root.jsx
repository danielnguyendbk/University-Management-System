import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  BookOpen,
  Calendar,
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

const navigation = [
  { name: "Trang chủ", name_vi: "Tổng quan hệ thống", href: "/portal", icon: LayoutDashboard },
  { name: "Thông báo", name_vi: "Tin tức và nhắc nhở", href: "/portal/announcements", icon: Bell },
  { name: "Chương trình đào tạo", name_vi: "Lộ trình học tập", href: "/portal/curriculum", icon: BookOpen },
  { name: "Đăng ký môn học", name_vi: "Chọn lớp học phần", href: "/portal/course-registration", icon: ClipboardList },
  { name: "Thời khóa biểu tuần", name_vi: "Lịch học theo tuần", href: "/portal/schedule", icon: Calendar },
  { name: "Lịch thi", name_vi: "Kế hoạch thi cử", href: "/portal/exam-schedule", icon: CalendarCheck },
  { name: "Điểm số", name_vi: "Kết quả học tập", href: "/portal/grades", icon: GraduationCap },
  { name: "Học phí & Thanh toán", name_vi: "Theo dõi công nợ", href: "/portal/tuition", icon: DollarSign },
  { name: "Hóa đơn điện tử", name_vi: "Tra cứu và tải hóa đơn", href: "/portal/e-invoice", icon: FileText },
  { name: "Gửi yêu cầu", name_vi: "Nghỉ học hoặc phúc khảo", href: "/portal/submit-request", icon: Send },
  { name: "Duyệt yêu cầu", name_vi: "Dành cho giảng viên", href: "/portal/request-approval", icon: CheckSquare },
  { name: "Phản hồi", name_vi: "Đóng góp ý kiến", href: "/portal/feedback", icon: MessageSquare },
];

export function Root() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                <h1 className="font-semibold text-gray-900">Cổng thông tin sinh viên</h1>
                <p className="text-xs text-gray-500">Bảng điều khiển sinh viên</p>
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
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">ID: 2021001234</p>
              </div>
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-[73px] bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-20 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/portal" && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
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
