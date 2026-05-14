import { AlertTriangle, Info, XCircle } from "lucide-react";

import type {
  AllocationItem,
  ConflictItem,
  ConflictType,
  ConflictTypeConfig,
  ConflictSeverity,
  SeverityConfig,
} from "../types/allocation";

export const ALLOCATION_LIST: AllocationItem[] = [
  {
    id: "CS101.L11",
    name: "Lập trình HĐT",
    students: 45,
    reqRoom: "Phòng thường ≥45",
    assigned: "A-301",
    capacity: 50,
    day: "Thứ 2",
    slot: "Tiết 1-3",
    status: "ok",
  },
  {
    id: "MATH201.L02",
    name: "Toán cao cấp 2",
    students: 60,
    reqRoom: "Phòng thường ≥60",
    assigned: "B-105",
    capacity: 65,
    day: "Thứ 3",
    slot: "Tiết 4-6",
    status: "ok",
  },
  {
    id: "NET301.L05",
    name: "Mạng máy tính",
    students: 38,
    reqRoom: "Phòng máy tính ≥38",
    assigned: "",
    capacity: 0,
    day: "Thứ 4",
    slot: "Tiết 1-3",
    status: "unassigned",
  },
  {
    id: "AI401.L01",
    name: "Trí tuệ nhân tạo",
    students: 35,
    reqRoom: "Phòng thường ≥35",
    assigned: "A-301",
    capacity: 50,
    day: "Thứ 5",
    slot: "Tiết 1-3",
    status: "conflict",
  },
  {
    id: "SE302.L03",
    name: "Công nghệ PM",
    students: 48,
    reqRoom: "Phòng thường ≥50",
    assigned: "D-102",
    capacity: 55,
    day: "Thứ 6",
    slot: "Tiết 4-6",
    status: "ok",
  },
];

export const CONFLICT_LIST: ConflictItem[] = [
  {
    id: 1,
    type: "room",
    severity: "high",
    room: "A-301",
    day: "Thứ 4",
    slot: "Tiết 1-3",
    section1: "ENG102.L06 — Tiếng Anh kỹ thuật",
    section2: "CS501.L02 — Lập trình mạng",
    desc: "Hai lớp được phân cùng phòng, cùng ca học",
  },
  {
    id: 2,
    type: "lecturer",
    severity: "high",
    room: "—",
    day: "Thứ 5",
    slot: "Tiết 1-3",
    section1: "AI401.L01 — Trí tuệ nhân tạo",
    section2: "ML402.L01 — Học máy",
    desc: "GV PGS.TS. Hoàng Văn Nam dạy 2 lớp cùng thời điểm",
  },
  {
    id: 3,
    type: "capacity",
    severity: "medium",
    room: "C-101",
    day: "Thứ 3",
    slot: "Tiết 7-9",
    section1: "STAT201.L01 — Thống kê ứng dụng",
    section2: "—",
    desc: "Phòng C-101 sức chứa 40, lớp có 55 sinh viên",
  },
];

export const SEVERITY_CONFIG: Record<ConflictSeverity, SeverityConfig> = {
  high: { label: "Nghiêm trọng", className: "bg-red-100 text-red-700", icon: XCircle },
  medium: { label: "Trung bình", className: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  low: { label: "Thấp", className: "bg-yellow-100 text-yellow-700", icon: Info },
};

export const CONFLICT_TYPE_CONFIG: Record<ConflictType, ConflictTypeConfig> = {
  room: { label: "Trùng phòng", color: "bg-red-50 text-red-600 border-red-200" },
  lecturer: { label: "Trùng GV", color: "bg-purple-50 text-purple-600 border-purple-200" },
  capacity: { label: "Quá sức chứa", color: "bg-orange-50 text-orange-600 border-orange-200" },
};
