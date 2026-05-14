import {
  BookMarked,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PlusSquare,
  School,
  Search,
  Settings,
  UserCog,
  Users,
  Wand2,
} from "lucide-react";

import type { UserRole } from "@/types/auth";
import type { NavigationByRole } from "@/types/navigation";
import { APP_ROUTES } from "./routes";

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: "Quản trị viên",
  Staff: "Giáo vụ",
  Lecturer: "Giảng viên",
  Employee: "Nhân viên",
  Student: "Sinh viên",
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  Admin: "bg-red-100 text-red-700",
  Staff: "bg-blue-100 text-blue-700",
  Lecturer: "bg-purple-100 text-purple-700",
  Employee: "bg-orange-100 text-orange-700",
  Student: "bg-green-100 text-green-700",
};

export const NAVIGATION_BY_ROLE: NavigationByRole = {
  Admin: [
    { icon: LayoutDashboard, label: "Tổng quan", path: APP_ROUTES.home },
    { icon: School, label: "Phòng học", path: APP_ROUTES.classrooms },
    { icon: BookOpen, label: "Môn học", path: APP_ROUTES.courses },
    { icon: Users, label: "Giảng viên", path: APP_ROUTES.lecturers },
    { icon: Calendar, label: "Thời khóa biểu", path: APP_ROUTES.timetable },
    { icon: CalendarDays, label: "Lịch tuần", path: APP_ROUTES.weeklySchedule },
    { icon: Wand2, label: "Phân công tự động", path: APP_ROUTES.autoAssignment },
    { icon: FileText, label: "Báo cáo", path: APP_ROUTES.reports },
    { icon: UserCog, label: "Quản lý người dùng", path: APP_ROUTES.userManagement },
    { icon: Settings, label: "Cài đặt", path: APP_ROUTES.settings },
  ],
  Staff: [
    { icon: LayoutDashboard, label: "Tổng quan", path: APP_ROUTES.staffDashboard },
    { icon: ClipboardList, label: "Lớp học phần", path: APP_ROUTES.staffSections },
    { icon: Calendar, label: "Thời khóa biểu", path: APP_ROUTES.staffSchedule },
    { icon: Building2, label: "Phân phòng & Xung đột", path: APP_ROUTES.staffAllocation },
    { icon: Search, label: "Tra cứu lịch", path: APP_ROUTES.staffLookup },
    { icon: PlusSquare, label: "Đặt phòng khẩn cấp", path: APP_ROUTES.staffBookings, badge: "Mới" },
    { icon: ClipboardCheck, label: "Danh sách đặt phòng", path: APP_ROUTES.staffBookingList },
  ],
  Lecturer: [
    { icon: CalendarCheck, label: "Lịch dạy của tôi", path: APP_ROUTES.lecturerDashboard },
    { icon: BookMarked, label: "Yêu cầu & Phản hồi", path: APP_ROUTES.lecturerRequests },
  ],
  Employee: [{ icon: Eye, label: "Lịch sử dụng phòng", path: APP_ROUTES.employeeDashboard }],
  Student: [{ icon: GraduationCap, label: "Tra cứu thời khóa biểu", path: APP_ROUTES.studentDashboard }],
};
