// Admin Dashboard Mock Data - KPIs, Alerts, Requests, Conflicts, etc.

export const adminKpis = {
  totalClassrooms: 45,
  classroomsManaged: 38,
  pendingRequests: 12,
  roomConflicts: 3,
  maintenanceRooms: 2,
}

export type Alert = {
  readonly id: string
  readonly title: string
  readonly message: string
  readonly severity: 'critical' | 'warning' | 'info' | 'success'
  readonly timestamp: string
  readonly icon?: string
}

export const adminAlerts: readonly Alert[] = [
  {
    id: 'alert-1',
    title: 'Xung đột trùng giờ',
    message: 'Xung đột trùng giờ tại B304 và B306',
    severity: 'critical',
    timestamp: '5 phút trước',
  },
  {
    id: 'alert-2',
    title: 'Bảo trì khẩn',
    message: 'Bảo trì khẩn tại hội trường A',
    severity: 'warning',
    timestamp: '15 phút trước',
  },
  {
    id: 'alert-3',
    title: 'Đồng bộ lịch',
    message: 'Đồng bộ lịch tuần toàn trường thành công',
    severity: 'success',
    timestamp: '1 giờ trước',
  },
]

export type Request = {
  readonly id: string
  readonly code: string
  readonly type: string
  readonly requester: string
  readonly role: string
  readonly timestamp: string
  readonly priority: 'high' | 'medium' | 'low'
  readonly status: 'pending' | 'processing' | 'approved' | 'rejected'
  readonly description?: string
  readonly evidence?: string
  readonly suggestedRooms?: string[]
  readonly timeline?: readonly TimelineEvent[]
}

export type TimelineEvent = {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly timestamp: string
  readonly actor: string
  readonly action: string
}

export const adminRequests: readonly Request[] = [
  {
    id: 'req-1',
    code: 'REQ20260417001',
    type: 'Đặt phòng học',
    requester: 'Dr. Nguyễn Văn A',
    role: 'Giảng viên',
    timestamp: '17/04/2026 09:30',
    priority: 'high',
    status: 'pending',
    description: 'Yêu cầu đặt phòng A205 cho lớp INT3302 vào thứ ba 10:00-12:00',
    evidence: 'Chương trình giảng dạy INT3302_2026.pdf',
    suggestedRooms: ['A205', 'A206', 'B101'],
    timeline: [
      {
        id: 'tm-1',
        title: 'Gửi yêu cầu',
        timestamp: '17/04/2026 09:30',
        actor: 'Dr. Nguyễn Văn A',
        action: 'Gửi',
      },
      {
        id: 'tm-2',
        title: 'Kiểm tra ban đầu',
        timestamp: '17/04/2026 09:45',
        actor: 'Admin System',
        action: 'Kiểm tra',
      },
    ],
  },
  {
    id: 'req-2',
    code: 'REQ20260417002',
    type: 'Thay đổi thời gian lớp',
    requester: 'Dr. Trần Thị B',
    role: 'Giảng viên',
    timestamp: '17/04/2026 10:15',
    priority: 'medium',
    status: 'processing',
    description: 'Dời lớp QTDL2201 từ thứ tư sang thứ năm',
    suggestedRooms: ['B202', 'B203'],
  },
  {
    id: 'req-3',
    code: 'REQ20260417003',
    type: 'Nâng cấp thiết bị',
    requester: 'Admin Phòng CTSV',
    role: 'Quản trị',
    timestamp: '17/04/2026 08:00',
    priority: 'low',
    status: 'approved',
    description: 'Nâng cấp hệ thống âm thanh phòng A101',
  },
]

export type Conflict = {
  readonly id: string
  readonly code: string
  readonly reason: string
  readonly affectedRooms: readonly string[]
  readonly affectedClasses: readonly string[]
  readonly severity: 'high' | 'medium' | 'low'
  readonly timeSlot: string
  readonly suggestedReplacement?: string
  readonly description?: string
  readonly impact?: string
}

export const adminConflicts: readonly Conflict[] = [
  {
    id: 'conflict-1',
    code: 'CON20260417001',
    reason: 'Xung đột sử dụng phòng',
    affectedRooms: ['B304', 'B306'],
    affectedClasses: ['INT3302', 'QTDL2201'],
    severity: 'high',
    timeSlot: '09:45-11:35',
    suggestedReplacement: 'B305',
    description: 'Hai lớp được gán cùng phòng B304 vào cùng một khung giờ',
    impact: 'Ảnh hưởng đến 60 sinh viên',
  },
  {
    id: 'conflict-2',
    code: 'CON20260417002',
    reason: 'Thiếu khả năng chứa',
    affectedRooms: ['A201'],
    affectedClasses: ['CS401'],
    severity: 'medium',
    timeSlot: '13:00-15:20',
    suggestedReplacement: 'A301',
    description: 'Sức chứa phòng (40 chỗ) không đủ cho lớp (55 sinh viên)',
  },
  {
    id: 'conflict-3',
    code: 'CON20260417003',
    reason: 'Sai loại phòng',
    affectedRooms: ['C402'],
    affectedClasses: ['PE102'],
    severity: 'low',
    timeSlot: '15:30-17:00',
    suggestedReplacement: 'Gym Building',
    description: 'Lớp thực hành cần phòng chuyên biệt nhưng được gán phòng thường',
  },
]

export type RoomUsageToday = {
  readonly id: string
  readonly room: string
  readonly timeSlot: string
  readonly className: string
  readonly status: string
  readonly note?: string
}

export const roomUsageTodayData: readonly RoomUsageToday[] = [
  {
    id: 'usage-1',
    room: 'A205',
    timeSlot: '09:45-11:35',
    className: 'INT3302',
    status: 'Đã đổi vào',
    note: 'Thay thế từ B304',
  },
  {
    id: 'usage-2',
    room: 'B304',
    timeSlot: '09:45-15:20',
    className: 'Tạm khóa',
    status: 'Lỗi thiết bị',
    note: 'Projector hỏng, chờ sửa',
  },
  {
    id: 'usage-3',
    room: 'C402',
    timeSlot: '13:00-15:20',
    className: 'QTDL2201',
    status: 'Theo dõi',
    note: 'Lớp mới được gán',
  },
  {
    id: 'usage-4',
    room: 'A101',
    timeSlot: '15:30-17:00',
    className: 'CS401',
    status: 'Đang dạy',
    note: '',
  },
  {
    id: 'usage-5',
    room: 'B202',
    timeSlot: '18:00-19:30',
    className: 'Math201',
    status: 'Chờ phê duyệt',
    note: 'Đợi xác nhận từ giáo vụ',
  },
]

export type Notification = {
  readonly id: string
  readonly message: string
  readonly timestamp: string
  readonly status: 'completed' | 'pending' | 'warning' | 'error'
}

export const systemNotifications: readonly Notification[] = [
  {
    id: 'notif-1',
    message: 'Đã đồng bộ lịch tuần toàn trường',
    timestamp: '17/04/2026 10:30',
    status: 'completed',
  },
  {
    id: 'notif-2',
    message: 'Phát hiện 14 xung đột mới sau khi import dữ liệu',
    timestamp: '17/04/2026 10:15',
    status: 'warning',
  },
  {
    id: 'notif-3',
    message: 'Cấu hình thông báo email sinh viên đang chờ xác nhận',
    timestamp: '17/04/2026 09:45',
    status: 'pending',
  },
  {
    id: 'notif-4',
    message: 'Không thể tải danh sách sinh viên từ hệ thống DATN',
    timestamp: '17/04/2026 08:30',
    status: 'error',
  },
]

export type SettingsPreview = {
  readonly semester: string
  readonly timeFrames: string
  readonly notifications: boolean
  readonly permissions: string
  readonly maintenanceMode: boolean
}

export const settingsPreview: SettingsPreview = {
  semester: 'Học kỳ I 2025-2026',
  timeFrames: 'Sáng 07:00-10:30, Chiều 13:00-16:30, Tối 18:00-21:30',
  notifications: true,
  permissions: 'Quản trị: Toàn quyền, Giảng viên: Quản lý lớp của mình',
  maintenanceMode: false,
}

export type ReportSummary = {
  readonly roomUtilization: number
  readonly approvalRate: number
  readonly conflictPerWeek: number
  readonly prolongedMaintenance: number
}

export const reportSummary: ReportSummary = {
  roomUtilization: 85,
  approvalRate: 92,
  conflictPerWeek: 3,
  prolongedMaintenance: 2,
}

export type AutoAllocationStatus = {
  readonly currentRules: string
  readonly lastRun: string
  readonly classroomsAllocated: number
  readonly classroomsNeedManualApproval: number
  readonly errors: string[]
}

export const autoAllocationStatus: AutoAllocationStatus = {
  currentRules: 'Quy tắc cấp độ 3 (v2.1)',
  lastRun: '17/04/2026 06:30 (cập nhật)',
  classroomsAllocated: 128,
  classroomsNeedManualApproval: 12,
  errors: ['Vượt sức chứa: 2 lớp', 'Sai loại phòng: 1 lớp'],
}

export type SuggestedRoom = {
  readonly id: string
  readonly roomCode: string
  readonly capacity: number
  readonly features: readonly string[]
  readonly fit: string
  readonly utilization: number
  readonly distance?: number
}

export const suggestedRooms: readonly SuggestedRoom[] = [
  {
    id: 'suggested-1',
    roomCode: 'A205',
    capacity: 60,
    features: ['Projector', 'Whiteboard'],
    fit: 'Phù hợp hoàn hảo',
    utilization: 65,
  },
  {
    id: 'suggested-2',
    roomCode: 'A206',
    capacity: 50,
    features: ['Projector', 'Smart Board'],
    fit: 'Chấp nhận được',
    utilization: 72,
  },
  {
    id: 'suggested-3',
    roomCode: 'B101',
    capacity: 80,
    features: ['Projector', 'AC', 'Whiteboard'],
    fit: 'Sức chứa thừa',
    utilization: 45,
  },
]

export type AdminUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: string
  readonly avatar?: string
  readonly lastLogin: string
  readonly permissions: readonly string[]
}

export const currentAdminUser: AdminUser = {
  id: 'admin-1',
  name: 'Admin Quản Trị',
  email: 'admin@university.edu.vn',
  role: 'Quản trị viên Hệ thống',
  avatar: 'https://ui-avatars.com/api/?name=Admin+Quan+Tri',
  lastLogin: '17/04/2026 08:00',
  permissions: ['manage_all', 'approve_requests', 'resolve_conflicts', 'manage_staff'],
}

export type SemesterScope = {
  readonly semester: string
  readonly academicYear: string
  readonly totalClasses: number
  readonly totalStudents: number
  readonly totalLecturers: number
}

export const currentSemesterScope: SemesterScope = {
  semester: 'Kỳ I',
  academicYear: '2025-2026',
  totalClasses: 150,
  totalStudents: 4250,
  totalLecturers: 87,
}

export type OperationalProgress = {
  readonly label: string
  readonly current: number
  readonly total: number
  readonly percentage: number
}

export const operationalProgress: readonly OperationalProgress[] = [
  {
    label: 'Nhập dữ liệu',
    current: 128,
    total: 150,
    percentage: 85,
  },
  {
    label: 'Kiểm soát xung đột',
    current: 147,
    total: 150,
    percentage: 98,
  },
  {
    label: 'Phê duyệt cuối cùng',
    current: 95,
    total: 150,
    percentage: 63,
  },
]
