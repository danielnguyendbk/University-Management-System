import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  ClipboardList,
  ListChecks,
  PlusSquare,
  Search,
} from "lucide-react";

import { APP_ROUTES } from "@/constants/routes";
import type { RecentSection, SectionStatus, StaffQuickAction, StaffStatItem } from "../types/dashboard";

export const STAFF_STATS: StaffStatItem[] = [
  {
    title: "Lớp học phần HK1",
    value: "186",
    sub: "+12 so với HK trước",
    icon: ClipboardList,
    color: "bg-blue-500",
    text: "text-blue-700",
  },
  {
    title: "Đã phân phòng",
    value: "161",
    sub: "86.6% tổng lớp học phần",
    icon: Building2,
    color: "bg-green-500",
    text: "text-green-700",
  },
  {
    title: "Chưa phân phòng",
    value: "25",
    sub: "Cần xử lý trước 15/08",
    icon: AlertTriangle,
    color: "bg-orange-500",
    text: "text-orange-700",
  },
  {
    title: "Yêu cầu đặt phòng",
    value: "8",
    sub: "3 chờ duyệt, 5 đã duyệt",
    icon: CalendarCheck,
    color: "bg-purple-500",
    text: "text-purple-700",
  },
];

export const STAFF_QUICK_ACTIONS: StaffQuickAction[] = [
  {
    label: "Quản lý lớp học phần",
    icon: ClipboardList,
    path: APP_ROUTES.staffSections,
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
  },
  {
    label: "Quản lý thời khóa biểu",
    icon: ListChecks,
    path: APP_ROUTES.staffSchedule,
    color: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
  },
  {
    label: "Phân phòng & Xung đột",
    icon: Building2,
    path: APP_ROUTES.staffAllocation,
    color: "text-teal-600",
    bg: "bg-teal-50 hover:bg-teal-100",
  },
  {
    label: "Tra cứu lịch phòng",
    icon: Search,
    path: APP_ROUTES.staffLookup,
    color: "text-cyan-600",
    bg: "bg-cyan-50 hover:bg-cyan-100",
  },
  {
    label: "Tra cứu lịch học",
    icon: CalendarCheck,
    path: APP_ROUTES.staffLookup,
    color: "text-violet-600",
    bg: "bg-violet-50 hover:bg-violet-100",
  },
  {
    label: "Danh sách phòng trống",
    icon: Building2,
    path: APP_ROUTES.staffLookup,
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    label: "Đặt phòng khẩn cấp",
    icon: PlusSquare,
    path: APP_ROUTES.staffBookings,
    color: "text-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100",
  },
  {
    label: "Danh sách đặt phòng",
    icon: ListChecks,
    path: APP_ROUTES.staffBookingList,
    color: "text-rose-600",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
];

export const RECENT_SECTIONS: RecentSection[] = [
  {
    id: "CS101.L11",
    name: "Lập trình hướng đối tượng",
    credits: 3,
    students: 45,
    room: "A-301",
    day: "Thứ 2",
    slot: "Tiết 1-3",
    status: "assigned",
  },
  {
    id: "MATH201.L02",
    name: "Toán cao cấp 2",
    credits: 4,
    students: 60,
    room: "B-105",
    day: "Thứ 3",
    slot: "Tiết 4-6",
    status: "assigned",
  },
  {
    id: "NET301.L05",
    name: "Mạng máy tính",
    credits: 3,
    students: 38,
    room: "",
    day: "Thứ 4",
    slot: "Tiết 1-3",
    status: "pending",
  },
  {
    id: "DB202.L08",
    name: "Cơ sở dữ liệu",
    credits: 3,
    students: 52,
    room: "C-201",
    day: "Thứ 4",
    slot: "Tiết 7-9",
    status: "assigned",
  },
  {
    id: "AI401.L01",
    name: "Trí tuệ nhân tạo",
    credits: 3,
    students: 35,
    room: "",
    day: "Thứ 5",
    slot: "Tiết 1-3",
    status: "conflict",
  },
  {
    id: "SE302.L03",
    name: "Công nghệ phần mềm",
    credits: 3,
    students: 48,
    room: "D-102",
    day: "Thứ 6",
    slot: "Tiết 4-6",
    status: "assigned",
  },
];

export const STATUS_CONFIG: Record<
  SectionStatus,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  assigned: { label: "Đã phân phòng", className: "bg-green-100 text-green-700", icon: CalendarCheck },
  pending: { label: "Chưa phân phòng", className: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  conflict: { label: "Xung đột", className: "bg-red-100 text-red-700", icon: AlertTriangle },
};
