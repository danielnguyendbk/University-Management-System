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
  Wand2
} from "lucide-react";
import { APP_ROUTES } from "./routes";
const ROLE_LABELS = {
  Admin: "Qu\u1EA3n tr\u1ECB vi\xEAn",
  Staff: "Gi\xE1o v\u1EE5",
  Lecturer: "Gi\u1EA3ng vi\xEAn",
  Employee: "Nh\xE2n vi\xEAn",
  Student: "Sinh vi\xEAn"
};
const ROLE_BADGE_CLASSES = {
  Admin: "bg-red-100 text-red-700",
  Staff: "bg-blue-100 text-blue-700",
  Lecturer: "bg-purple-100 text-purple-700",
  Employee: "bg-orange-100 text-orange-700",
  Student: "bg-green-100 text-green-700"
};
const NAVIGATION_BY_ROLE = {
  Admin: [
    { icon: LayoutDashboard, label: "T\u1ED5ng quan", path: APP_ROUTES.home },
    { icon: School, label: "Ph\xF2ng h\u1ECDc", path: APP_ROUTES.classrooms },
    { icon: BookOpen, label: "M\xF4n h\u1ECDc", path: APP_ROUTES.courses },
    { icon: Users, label: "Gi\u1EA3ng vi\xEAn", path: APP_ROUTES.lecturers },
    { icon: Calendar, label: "Th\u1EDDi kh\xF3a bi\u1EC3u", path: APP_ROUTES.timetable },
    { icon: CalendarDays, label: "L\u1ECBch tu\u1EA7n", path: APP_ROUTES.weeklySchedule },
    { icon: Wand2, label: "Ph\xE2n c\xF4ng t\u1EF1 \u0111\u1ED9ng", path: APP_ROUTES.autoAssignment },
    { icon: FileText, label: "B\xE1o c\xE1o", path: APP_ROUTES.reports },
    { icon: UserCog, label: "Qu\u1EA3n l\xFD ng\u01B0\u1EDDi d\xF9ng", path: APP_ROUTES.userManagement },
    { icon: Settings, label: "C\xE0i \u0111\u1EB7t", path: APP_ROUTES.settings }
  ],
  Staff: [
    { icon: LayoutDashboard, label: "T\u1ED5ng quan", path: APP_ROUTES.staffDashboard },
    { icon: ClipboardList, label: "L\u1EDBp h\u1ECDc ph\u1EA7n", path: APP_ROUTES.staffSections },
    { icon: Calendar, label: "Th\u1EDDi kh\xF3a bi\u1EC3u", path: APP_ROUTES.staffSchedule },
    { icon: Building2, label: "Ph\xE2n ph\xF2ng & Xung \u0111\u1ED9t", path: APP_ROUTES.staffAllocation },
    { icon: Search, label: "Tra c\u1EE9u l\u1ECBch", path: APP_ROUTES.staffLookup },
    { icon: PlusSquare, label: "\u0110\u1EB7t ph\xF2ng kh\u1EA9n c\u1EA5p", path: APP_ROUTES.staffBookings, badge: "M\u1EDBi" },
    { icon: ClipboardCheck, label: "Danh s\xE1ch \u0111\u1EB7t ph\xF2ng", path: APP_ROUTES.staffBookingList },
    { icon: Building2, label: "Danh s\xE1ch \u0111\u1ED5i ph\xF2ng", path: APP_ROUTES.staffRoomChangeList },
    { icon: ClipboardCheck, label: "Duy\u1EC7t \u0111\u1ED5i ph\xF2ng", path: APP_ROUTES.staffRoomChangeList }
  ],
  Lecturer: [
    { icon: CalendarCheck, label: "L\u1ECBch d\u1EA1y c\u1EE7a t\xF4i", path: APP_ROUTES.lecturerDashboard },
    { icon: BookMarked, label: "Y\xEAu c\u1EA7u & Ph\u1EA3n h\u1ED3i", path: APP_ROUTES.lecturerRequests },
    { icon: Building2, label: "Xin \u0111\u1ED5i ph\xF2ng", path: APP_ROUTES.lecturerRoomChangeRequest },
    { icon: ClipboardCheck, label: "Tr\u1EA1ng th\xE1i \u0111\u1ED5i ph\xF2ng", path: APP_ROUTES.lecturerRoomChangeList }
  ],
  Employee: [{ icon: Eye, label: "L\u1ECBch s\u1EED d\u1EE5ng ph\xF2ng", path: APP_ROUTES.employeeDashboard }],
  Student: [{ icon: GraduationCap, label: "Tra c\u1EE9u th\u1EDDi kh\xF3a bi\u1EC3u", path: APP_ROUTES.studentDashboard }]
};
export {
  NAVIGATION_BY_ROLE,
  ROLE_BADGE_CLASSES,
  ROLE_LABELS
};
