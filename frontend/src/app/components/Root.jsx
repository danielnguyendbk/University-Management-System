import { Outlet, Link, useLocation } from "react-router";
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
  { name: "Dashboard", name_vi: "Trang chủ", href: "/portal", icon: LayoutDashboard },
  { name: "Announcements", name_vi: "Thông báo từ ban quản trị", href: "/portal/announcements", icon: Bell },
  { name: "Curriculum", name_vi: "Chương trình đào tạo", href: "/portal/curriculum", icon: BookOpen },
  { name: "Course Registration", name_vi: "Đăng ký môn học", href: "/portal/course-registration", icon: ClipboardList },
  { name: "Weekly Schedule", name_vi: "Thời khóa biểu dạng tuần", href: "/portal/schedule", icon: Calendar },
  { name: "Exam Schedule", name_vi: "Lịch thi", href: "/portal/exam-schedule", icon: CalendarCheck },
  { name: "Grades", name_vi: "Xem điểm", href: "/portal/grades", icon: GraduationCap },
  { name: "Tuition & Payment", name_vi: "Học phí & Thanh toán", href: "/portal/tuition", icon: DollarSign },
  { name: "E-Invoice", name_vi: "Hóa đơn điện tử", href: "/portal/e-invoice", icon: FileText },
  { name: "Submit Request", name_vi: "Gửi đơn xin nghỉ / phúc khảo", href: "/portal/submit-request", icon: Send },
  { name: "Request Approval", name_vi: "Dành cho giảng viên", href: "/portal/request-approval", icon: CheckSquare },
  { name: "Feedback", name_vi: "Gửi ý kiến", href: "/portal/feedback", icon: MessageSquare },
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
                <h1 className="font-semibold text-gray-900">University Portal</h1>
                <p className="text-xs text-gray-500">Student Dashboard</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, announcements..."
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
