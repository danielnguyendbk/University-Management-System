---
name: university-timetable-portal
description: Builds university classroom and timetable management portal with React + Vite + Tailwind, featuring role-based dashboards, approval workflows, conflict resolution, and weekly grid timetables with 30-minute slot time management.
project-type: React + Vite + Tailwind
roles: admin, lecturer, student, staff
features: timetable-management, approval-workflows, conflict-resolution, dashboards
---

# University Timetable Management Portal Skill

You are a full-stack frontend engineer building a comprehensive university classroom and timetable management portal. This skill defines architectural standards, component patterns, and project-specific rules to ensure consistency, maintainability, and scalability.

## Project Overview

### Purpose
The portal serves four distinct user roles:
- **Admin**: Manage users, classrooms, subjects, and system configuration
- **Lecturer**: Schedule subjects, manage classrooms, view timetables
- **Student**: View personal timetable, enroll in subjects
- **Staff**: Support users, manage approvals, resolve conflicts

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3+
- **State Management**: React Context + useReducer or Zustand
- **Routing**: React Router v6+
- **Date/Time**: Day.js or date-fns
- **HTTP Client**: Axios or Fetch API
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Headless UI or Radix UI for accessibility

---

## Project Architecture

### Folder Structure

```
university-timetable-portal/
├── .vscode/
│   ├── mcp.json                    # Stitch MCP config
│   └── launch.json                 # Debug config
├── .stitch/
│   └── designs/                    # Downloaded design files
├── src/
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   ├── index.css                   # Global styles
│   ├── components/
│   │   ├── common/                 # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layouts/                # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── timetable/              # Timetable-specific
│   │   │   ├── WeeklyGrid.tsx      # Main timetable grid
│   │   │   ├── TimeSlotColumn.tsx  # Left side time display
│   │   │   ├── SubjectBlock.tsx    # Individual subject block
│   │   │   ├── TimetableToolbar.tsx
│   │   │   └── TimetableLegend.tsx
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── LecturerDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── approval/               # Approval workflow
│   │   │   ├── ApprovalCenter.tsx
│   │   │   ├── ApprovalList.tsx
│   │   │   ├── ApprovalCard.tsx
│   │   │   ├── ApprovalModal.tsx
│   │   │   └── ApprovalFilter.tsx
│   │   ├── conflict/               # Conflict resolution
│   │   │   ├── ConflictCenter.tsx
│   │   │   ├── ConflictList.tsx
│   │   │   ├── ConflictDetail.tsx
│   │   │   ├── ConflictAnalyzer.tsx
│   │   │   └── ResolutionForm.tsx
│   │   └── forms/                  # Form components
│   │       ├── SubjectForm.tsx
│   │       ├── ClassroomForm.tsx
│   │       ├── UserForm.tsx
│   │       └── TimetableForm.tsx
│   ├── hooks/
│   │   ├── useTimetable.ts         # Timetable logic
│   │   ├── useApprovals.ts         # Approval workflow
│   │   ├── useConflicts.ts         # Conflict detection
│   │   ├── useAuth.ts              # Authentication
│   │   ├── useRole.ts              # Role-based access
│   │   ├── useTimeSlots.ts         # Time slot calculations
│   │   └── useLocalStorage.ts      # Persistence
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state
│   │   ├── RoleContext.tsx         # Role management
│   │   ├── NotificationContext.tsx # Toast notifications
│   │   └── ThemeContext.tsx        # Theme management
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Timetable.tsx
│   │   ├── ApprovalCenter.tsx
│   │   ├── ConflictCenter.tsx
│   │   ├── Admin/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ClassroomManagement.tsx
│   │   │   ├── SubjectManagement.tsx
│   │   │   └── SystemSettings.tsx
│   │   ├── Lecturer/
│   │   │   ├── MyTimetable.tsx
│   │   │   ├── ScheduleSubject.tsx
│   │   │   └── ClassroomRequests.tsx
│   │   ├── Student/
│   │   │   ├── MyTimetable.tsx
│   │   │   └── MySubjects.tsx
│   │   ├── Staff/
│   │   │   ├── SupportDashboard.tsx
│   │   │   └── BulkOperations.tsx
│   │   ├── 404.tsx
│   │   └── ErrorBoundary.tsx
│   ├── routes/
│   │   ├── index.ts                # Route definitions
│   │   ├── ProtectedRoute.tsx       # Role-based routing
│   │   └── routeConfig.ts          # Route configuration
│   ├── services/
│   │   ├── api.ts                  # API base config
│   │   ├── timetableService.ts     # Timetable API
│   │   ├── userService.ts          # User API
│   │   ├── approvalService.ts      # Approval API
│   │   ├── conflictService.ts      # Conflict API
│   │   └── authService.ts          # Auth API
│   ├── store/
│   │   ├── timetableStore.ts       # Zustand (optional)
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   ├── data/
│   │   ├── mockData.ts             # All mock data
│   │   ├── mockTimetables.ts       # Timetable mocks
│   │   ├── mockUsers.ts            # User mocks
│   │   ├── mockApprovals.ts        # Approval mocks
│   │   ├── mockConflicts.ts        # Conflict mocks
│   │   └── mockClassrooms.ts       # Classroom mocks
│   ├── types/
│   │   ├── index.ts                # Type exports
│   │   ├── user.ts
│   │   ├── timetable.ts
│   │   ├── classroom.ts
│   │   ├── subject.ts
│   │   ├── approval.ts
│   │   ├── conflict.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── constants.ts            # App constants
│   │   ├── timeSlots.ts            # Time slot utilities
│   │   ├── validation.ts           # Form validation
│   │   ├── formatting.ts           # Date/time formatting
│   │   ├── helpers.ts              # General helpers
│   │   ├── conflictDetection.ts    # Conflict algorithms
│   │   └── permissions.ts          # Role permissions
│   ├── styles/
│   │   ├── tailwind.config.ts
│   │   ├── globals.css
│   │   └── components.css
│   └── resources/
│       ├── component-template.tsx
│       ├── style-guide.json
│       ├── architecture-checklist.md
│       └── design-tokens.json
├── scripts/
│   ├── fetch-stitch.sh
│   ├── seed-mock-data.ts
│   └── validate-timetable.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env
├── .env.example
├── .env.test
├── .gitignore
├── .prettierrc
├── .eslintrc.cjs
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── package.json
├── DESIGN.md
├── SKILL.md                        # This file
└── README.md
```

---

## Core Type Definitions

### User Roles and Permissions

```typescript
// types/user.ts
export type UserRole = 'admin' | 'lecturer' | 'student' | 'staff';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly department?: string;
  readonly avatar?: string;
  readonly createdAt: string;
}

export interface Permissions {
  readonly admin: {
    readonly manageUsers: boolean;
    readonly manageClassrooms: boolean;
    readonly manageSubjects: boolean;
    readonly viewAllTimetables: boolean;
    readonly approveConflicts: boolean;
  };
  readonly lecturer: {
    readonly scheduleLessons: boolean;
    readonly requestClassrooms: boolean;
    readonly viewAssignedTimetable: boolean;
    readonly viewStudentList: boolean;
  };
  readonly student: {
    readonly viewPersonalTimetable: boolean;
    readonly enrollSubjects: boolean;
    readonly viewLecturerInfo: boolean;
  };
  readonly staff: {
    readonly supportUsers: boolean;
    readonly approveRequests: boolean;
    readonly resolveConflicts: boolean;
  };
}
```

### Timetable Domain

```typescript
// types/timetable.ts
export type TimeSlot = 
  | 'morning'   // 07:00-10:30
  | 'afternoon' // 13:00-16:30
  | 'evening';  // 18:00-21:30

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday';

export interface TimeRange {
  readonly startTime: string;  // HH:mm format
  readonly endTime: string;    // HH:mm format
}

export interface TimetableSlot {
  readonly id: string;
  readonly dayOfWeek: DayOfWeek;
  readonly startTime: string;  // HH:mm
  readonly endTime: string;    // HH:mm
  readonly duration: number;   // minutes
  readonly subject: Subject;
  readonly lecturer: User;
  readonly classroom: Classroom;
  readonly notes?: string;
}

export interface WeeklyTimetable {
  readonly id: string;
  readonly weekNumber: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly slots: TimetableSlot[];
  readonly isPublished: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

### Approval and Conflict Domain

```typescript
// types/approval.ts
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  readonly id: string;
  readonly type: 'timetable_change' | 'classroom_booking' | 'subject_addition';
  readonly requester: User;
  readonly content: Record<string, unknown>;
  readonly status: ApprovalStatus;
  readonly assignedTo: User | null;
  readonly comments: string[];
  readonly createdAt: string;
  readonly resolvedAt?: string;
}

// types/conflict.ts
export type ConflictType = 
  | 'classroom_double_booking' 
  | 'lecturer_double_booking' 
  | 'student_time_overlap'
  | 'unavailable_time';

export interface Conflict {
  readonly id: string;
  readonly type: ConflictType;
  readonly severity: 'low' | 'medium' | 'high';
  readonly affectedSlots: TimetableSlot[];
  readonly description: string;
  readonly resolvedAt?: string;
  readonly resolutionNotes?: string;
  readonly createdAt: string;
}
```

---

## Timetable Grid Rules

### Time Slot System

**Definitions:**
- **Morning**: 07:00 – 10:30 (210 minutes)
- **Afternoon**: 13:00 – 16:30 (210 minutes)
- **Evening**: 18:00 – 21:30 (210 minutes)
- **Base Slot Duration**: 30 minutes
- **Grid Height per Slot**: 60px (Tailwind: `h-[60px]`)

### Weekly Grid Layout

```typescript
// utils/timeSlots.ts

export const TIME_SLOTS = {
  morning: {
    start: '07:00',
    end: '10:30',
    label: 'Morning',
    slotCount: 7,  // 07:00, 07:30, 08:00, ..., 10:00, 10:30
  },
  afternoon: {
    start: '13:00',
    end: '16:30',
    label: 'Afternoon',
    slotCount: 7,
  },
  evening: {
    start: '18:00',
    end: '21:30',
    label: 'Evening',
    slotCount: 7,
  },
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const generateTimeSlots = (): string[] => {
  // Generates array: ['07:00', '07:30', '08:00', ..., '21:30']
  const slots: string[] = [];
  const hours = [7, 8, 9, 10, 13, 14, 15, 16, 18, 19, 20, 21];
  
  hours.forEach(hour => {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  });
  
  return slots;
};

export const getSlotHeight = (startTime: string, endTime: string): string => {
  // Returns CSS height for subject block
  // Example: 08:00 to 09:00 = 2 slots = h-[120px]
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;
  const slotCount = duration / 30;
  return `h-[${slotCount * 60}px]`;
};

export const calculateTopOffset = (startTime: string): string => {
  // Returns CSS top position from grid top
  // Accounts for time before grid start (07:00)
  const minutes = timeToMinutes(startTime) - timeToMinutes('07:00');
  const slotCount = minutes / 30;
  return `top-[${slotCount * 60}px]`;
};
```

### WeeklyGrid Component

```typescript
// components/timetable/WeeklyGrid.tsx

interface WeeklyGridProps {
  readonly timetable: WeeklyTimetable;
  readonly selectedDay?: DayOfWeek;
  readonly userRole: UserRole;
  readonly onSubjectClick?: (slot: TimetableSlot) => void;
  readonly onTimeSlotClick?: (day: DayOfWeek, time: string) => void;
}

export const WeeklyGrid: React.FC<Readonly<WeeklyGridProps>> = ({
  timetable,
  selectedDay,
  userRole,
  onSubjectClick,
  onTimeSlotClick,
}) => {
  // Left column: Time labels in 30-minute intervals
  // Column headers: Days of week
  // Grid cells: Subject blocks positioned absolutely by time
  
  return (
    <div className="grid grid-cols-7 gap-0 bg-white rounded-lg shadow">
      {/* Time labels column */}
      <TimeSlotColumn />
      
      {/* Day columns */}
      {DAYS_OF_WEEK.map(day => (
        <DayColumn key={day} day={day} slots={timetable.slots} />
      ))}
    </div>
  );
};
```

### Subject Block Component

```typescript
// components/timetable/SubjectBlock.tsx

interface SubjectBlockProps {
  readonly slot: TimetableSlot;
  readonly userRole: UserRole;
  readonly onClick?: () => void;
}

export const SubjectBlock: React.FC<Readonly<SubjectBlockProps>> = ({
  slot,
  userRole,
  onClick,
}) => {
  // Positioned absolutely within grid cell
  // Height calculated from startTime to endTime
  // Color-coded by subject or status
  
  const height = getSlotHeight(slot.startTime, slot.endTime);
  const top = calculateTopOffset(slot.startTime);
  
  return (
    <div
      className={`
        absolute ${height} ${top}
        bg-blue-500 rounded p-2 text-white text-xs
        cursor-pointer hover:bg-blue-600
        border border-blue-600
      `}
      onClick={onClick}
    >
      <div className="font-bold">{slot.subject.name}</div>
      <div className="text-xs opacity-90">
        {slot.lecturer.name}
      </div>
      <div className="text-xs opacity-75">
        {slot.classroom.name}
      </div>
    </div>
  );
};
```

### Time Display Column

```typescript
// components/timetable/TimeSlotColumn.tsx

export const TimeSlotColumn: React.FC = () => {
  const timeSlots = generateTimeSlots();
  
  return (
    <div className="flex flex-col bg-gray-50 border-r border-gray-200 w-20">
      <div className="h-12 border-b border-gray-200 flex items-center justify-center">
        <span className="text-xs font-semibold">Time</span>
      </div>
      {timeSlots.map(time => (
        <div
          key={time}
          className="h-[60px] border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
        >
          {time}
        </div>
      ))}
    </div>
  );
};
```

---

## Reusable Component Patterns

### Modular Component Structure

Every component must follow this pattern:

```typescript
// components/common/Button.tsx

interface ButtonProps {
  readonly label: string;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'danger';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

export const Button: React.FC<Readonly<ButtonProps>> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <LoadingSpinner /> : label}
    </button>
  );
};
```

### Form Components

```typescript
// components/forms/SubjectForm.tsx

interface SubjectFormProps {
  readonly initialData?: Subject;
  readonly onSubmit: (data: Subject) => Promise<void>;
  readonly isLoading?: boolean;
}

export const SubjectForm: React.FC<Readonly<SubjectFormProps>> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Subject>({
    defaultValues: initialData,
    resolver: zodResolver(subjectSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Subject Name</label>
        <input
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter subject name"
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>

      <Button label="Submit" variant="primary" disabled={isLoading} loading={isLoading} />
    </form>
  );
};
```

### Layout Components

```typescript
// components/layouts/DashboardLayout.tsx

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly userRole: UserRole;
}

export const DashboardLayout: React.FC<Readonly<DashboardLayoutProps>> = ({
  children,
  userRole,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar role={userRole} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

---

## Feature: Admin Dashboard

### Purpose
Central management hub for system administrators to oversee all operations.

### Key Features
- **User Management**: CRUD operations for all user roles
- **Classroom Management**: Define classrooms, capacity, facilities
- **Subject Management**: Create and manage subjects
- **System Statistics**: Overview metrics and analytics
- **Approval Queue**: Review and approve pending requests
- **Conflict Overview**: View all system conflicts

### Component Structure

```typescript
// pages/Admin/AdminDashboard.tsx

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classrooms' | 'subjects'>('overview');

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers} />
          <StatCard label="Active Timetables" value={stats?.activeTimetables} />
          <StatCard label="Pending Approvals" value={stats?.pendingApprovals} />
          <StatCard label="Active Conflicts" value={stats?.activeConflicts} />
        </div>

        {/* Tab Navigation */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && <AdminOverview stats={stats} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'classrooms' && <ClassroomManagement />}
        {activeTab === 'subjects' && <SubjectManagement />}
      </div>
    </DashboardLayout>
  );
};
```

---

## Feature: Approval Center

### Purpose
Centralized workflow for reviewing and approving scheduling requests.

### Approval Types
- Timetable changes
- Classroom booking requests
- Subject additions
- Time slot modifications

### Component Structure

```typescript
// pages/ApprovalCenter.tsx

export const ApprovalCenter: React.FC = () => {
  const { approvals, loading } = useApprovals();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Approval Center</h1>
          <ApprovalFilter onFilterChange={setFilter} />
        </div>

        <ApprovalList
          approvals={approvals.filter(a => a.status === filter)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
};

// components/approval/ApprovalCard.tsx
interface ApprovalCardProps {
  readonly approval: ApprovalRequest;
  readonly onApprove: () => void;
  readonly onReject: () => void;
}

export const ApprovalCard: React.FC<Readonly<ApprovalCardProps>> = ({
  approval,
  onApprove,
  onReject,
}) => {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{approval.type}</h3>
          <p className="text-gray-600">By: {approval.requester.name}</p>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
            {JSON.stringify(approval.content, null, 2)}
          </pre>
        </div>
        <div className="flex gap-2">
          <Button label="Approve" variant="primary" onClick={onApprove} />
          <Button label="Reject" variant="danger" onClick={onReject} />
        </div>
      </div>
    </Card>
  );
};
```

---

## Feature: Conflict Center

### Purpose
Detect, analyze, and resolve scheduling conflicts automatically or manually.

### Conflict Detection Rules

```typescript
// utils/conflictDetection.ts

export const detectConflicts = (timetable: WeeklyTimetable): Conflict[] => {
  const conflicts: Conflict[] = [];

  // Rule 1: Classroom double booking
  const classroomMap = new Map<string, TimetableSlot[]>();
  timetable.slots.forEach(slot => {
    if (!classroomMap.has(slot.classroom.id)) {
      classroomMap.set(slot.classroom.id, []);
    }
    classroomMap.get(slot.classroom.id)?.push(slot);
  });

  classroomMap.forEach((slots, classroomId) => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (hasTimeOverlap(slots[i], slots[j])) {
          conflicts.push({
            id: `conflict_${i}_${j}`,
            type: 'classroom_double_booking',
            severity: 'high',
            affectedSlots: [slots[i], slots[j]],
            description: `Classroom ${classroomId} booked twice`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  });

  // Rule 2: Lecturer double booking
  // ... similar logic

  // Rule 3: Student time overlap
  // ... similar logic

  return conflicts;
};

const hasTimeOverlap = (slot1: TimetableSlot, slot2: TimetableSlot): boolean => {
  if (slot1.dayOfWeek !== slot2.dayOfWeek) return false;
  
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  return start1 < end2 && start2 < end1;
};
```

### Conflict Center Component

```typescript
// pages/ConflictCenter.tsx

export const ConflictCenter: React.FC = () => {
  const { conflicts, loading } = useConflicts();
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="grid grid-cols-3 gap-6">
        <ConflictList
          conflicts={conflicts}
          onSelectConflict={setSelectedConflict}
          selectedId={selectedConflict?.id}
        />
        {selectedConflict && (
          <ConflictDetail conflict={selectedConflict} />
        )}
        {selectedConflict && (
          <ResolutionForm conflict={selectedConflict} />
        )}
      </div>
    </DashboardLayout>
  );
};
```

---

## Role-Based UI Patterns

### Admin Dashboard

```typescript
// pages/Admin/AdminDashboard.tsx
Features:
- User CRUD management
- System-wide statistics
- Approval queue
- Conflict overview
- System settings
- Audit logs

Navigation Items:
- Users Management
- Classrooms
- Subjects
- Approvals
- Conflicts
- Settings
```

### Lecturer Dashboard

```typescript
// pages/Lecturer/LecturerDashboard.tsx
Features:
- Personal timetable
- Schedule new lessons
- Request classrooms
- View assigned subjects
- Student rosters

UI Elements:
- My Timetable (weekly grid)
- Quick Schedule Form
- Pending Requests
- Recent Activity
```

### Student Dashboard

```typescript
// pages/Student/StudentDashboard.tsx
Features:
- Personal timetable
- Enrolled subjects
- Lecturer info
- Schedule viewing

UI Elements:
- My Timetable (read-only)
- Enrolled Subjects List
- Class Schedule
- Downloads (Calendar export)
```

### Staff Dashboard

```typescript
// pages/Staff/StaffDashboard.tsx
Features:
- Support requests
- Approval workflows
- Conflict resolution
- Bulk operations
- User assistance

UI Elements:
- Support Queue
- Pending Approvals
- Conflict List
- Bulk Actions
- Reports
```

### Permission Check Helper

```typescript
// utils/permissions.ts

export const canAccessFeature = (role: UserRole, feature: string): boolean => {
  const permissions: Record<UserRole, string[]> = {
    admin: [
      'manage_users',
      'manage_classrooms',
      'manage_subjects',
      'view_all_timetables',
      'approve_conflicts',
      'system_settings',
    ],
    lecturer: [
      'schedule_lessons',
      'request_classrooms',
      'view_assigned_timetable',
      'view_student_list',
    ],
    student: [
      'view_personal_timetable',
      'enroll_subjects',
      'view_lecturer_info',
    ],
    staff: [
      'support_users',
      'approve_requests',
      'resolve_conflicts',
      'bulk_operations',
    ],
  };

  return permissions[role]?.includes(feature) ?? false;
};

// Usage in components
export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  feature,
  children,
  fallback,
}) => {
  const { user } = useAuth();
  
  if (!canAccessFeature(user.role, feature)) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
};
```

---

## Mock Data Structure

### Mock Data Organization

```typescript
// data/mockData.ts
export const mockData = {
  users: [...mockUsers],
  classrooms: [...mockClassrooms],
  subjects: [...mockSubjects],
  timetables: [...mockTimetables],
  approvals: [...mockApprovals],
  conflicts: [...mockConflicts],
};

// data/mockTimetables.ts
export const mockTimetables: WeeklyTimetable[] = [
  {
    id: 'timetable_1',
    weekNumber: 1,
    startDate: '2026-04-20',
    endDate: '2026-04-26',
    slots: [
      {
        id: 'slot_1',
        dayOfWeek: 'Monday',
        startTime: '07:00',
        endTime: '08:30',
        duration: 90,
        subject: mockSubjects[0],
        lecturer: mockUsers[1],
        classroom: mockClassrooms[0],
      },
      {
        id: 'slot_2',
        dayOfWeek: 'Monday',
        startTime: '13:00',
        endTime: '14:30',
        duration: 90,
        subject: mockSubjects[1],
        lecturer: mockUsers[2],
        classroom: mockClassrooms[1],
      },
      // ... more slots
    ],
    isPublished: true,
    createdAt: '2026-04-17T00:00:00Z',
    updatedAt: '2026-04-17T00:00:00Z',
  },
];

// data/mockUsers.ts
export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'admin@university.edu',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_2',
    email: 'lecturer1@university.edu',
    name: 'Dr. John Smith',
    role: 'lecturer',
    department: 'Computer Science',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_3',
    email: 'student1@university.edu',
    name: 'Jane Student',
    role: 'student',
    department: 'Computer Science',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

// data/mockClassrooms.ts
export const mockClassrooms: Classroom[] = [
  {
    id: 'classroom_1',
    name: 'Room 101',
    building: 'Engineering Block',
    capacity: 30,
    facilities: ['projector', 'whiteboard', 'ac'],
  },
];

// data/mockSubjects.ts
export const mockSubjects: Subject[] = [
  {
    id: 'subject_1',
    name: 'Introduction to Programming',
    code: 'CS101',
    credits: 3,
    department: 'Computer Science',
  },
];

// data/mockApprovals.ts
export const mockApprovals: ApprovalRequest[] = [
  {
    id: 'approval_1',
    type: 'timetable_change',
    requester: mockUsers[1],
    content: { reason: 'Room booking conflict' },
    status: 'pending',
    assignedTo: mockUsers[0],
    comments: [],
    createdAt: '2026-04-17T10:00:00Z',
  },
];

// data/mockConflicts.ts
export const mockConflicts: Conflict[] = [
  {
    id: 'conflict_1',
    type: 'classroom_double_booking',
    severity: 'high',
    affectedSlots: [/* ... */],
    description: 'Room 101 booked twice on Monday 07:00-08:30',
    createdAt: '2026-04-17T09:00:00Z',
  },
];
```

---

## Routing Configuration

### Route Structure

```typescript
// routes/index.ts
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'timetable',
        element: <ProtectedRoute requiredRoles={['admin', 'lecturer', 'student']} />,
        children: [
          { index: true, element: <Timetable /> },
          { path: 'schedule', element: <ScheduleTimetable /> },
          { path: ':id', element: <TimetableDetail /> },
        ],
      },
      {
        path: 'approvals',
        element: <ProtectedRoute requiredRoles={['admin', 'staff']} />,
        element: <ApprovalCenter />,
      },
      {
        path: 'conflicts',
        element: <ProtectedRoute requiredRoles={['admin', 'staff']} />,
        element: <ConflictCenter />,
      },
      {
        path: 'admin',
        element: <ProtectedRoute requiredRoles={['admin']} />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'classrooms', element: <ClassroomManagement /> },
          { path: 'subjects', element: <SubjectManagement /> },
          { path: 'settings', element: <SystemSettings /> },
        ],
      },
      {
        path: 'lecturer',
        element: <ProtectedRoute requiredRoles={['lecturer']} />,
        children: [
          { index: true, element: <LecturerDashboard /> },
          { path: 'my-timetable', element: <MyTimetable /> },
          { path: 'schedule', element: <ScheduleSubject /> },
        ],
      },
      {
        path: 'student',
        element: <ProtectedRoute requiredRoles={['student']} />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: 'my-timetable', element: <MyTimetable /> },
          { path: 'subjects', element: <MySubjects /> },
        ],
      },
      {
        path: 'staff',
        element: <ProtectedRoute requiredRoles={['staff']} />,
        children: [
          { index: true, element: <StaffDashboard /> },
          { path: 'support', element: <SupportDashboard /> },
          { path: 'bulk-ops', element: <BulkOperations /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'logout', element: <Logout /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
```

### Protected Route Component

```typescript
// routes/ProtectedRoute.tsx

interface ProtectedRouteProps {
  readonly requiredRoles: UserRole[];
  readonly children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<Readonly<ProtectedRouteProps>> = ({
  requiredRoles,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!requiredRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children ? <>{children}</> : <Outlet />;
};
```

---

## Hooks for Common Logic

### useApprovals Hook

```typescript
// hooks/useApprovals.ts

export const useApprovals = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await approvalService.getApprovals();
        setApprovals(data);
      } catch (error) {
        showNotification('Failed to load approvals', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const approveRequest = async (id: string, comments: string) => {
    try {
      await approvalService.approveRequest(id, comments);
      setApprovals(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'approved' as const } : a
      ));
      showNotification('Approval submitted', 'success');
    } catch (error) {
      showNotification('Failed to approve', 'error');
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    try {
      await approvalService.rejectRequest(id, reason);
      setApprovals(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'rejected' as const } : a
      ));
      showNotification('Request rejected', 'success');
    } catch (error) {
      showNotification('Failed to reject', 'error');
    }
  };

  return { approvals, loading, approveRequest, rejectRequest };
};
```

### useTimetable Hook

```typescript
// hooks/useTimetable.ts

export const useTimetable = (weekNumber?: number) => {
  const [timetable, setTimetable] = useState<WeeklyTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await timetableService.getTimetable(weekNumber);
        setTimetable(data);
      } catch (error) {
        showNotification('Failed to load timetable', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [weekNumber]);

  const addSlot = async (slot: TimetableSlot) => {
    if (!timetable) return;
    try {
      const updated = await timetableService.addSlot(timetable.id, slot);
      setTimetable(updated);
      showNotification('Slot added successfully', 'success');
    } catch (error) {
      showNotification('Failed to add slot', 'error');
    }
  };

  const updateSlot = async (slotId: string, updates: Partial<TimetableSlot>) => {
    if (!timetable) return;
    try {
      const updated = await timetableService.updateSlot(timetable.id, slotId, updates);
      setTimetable(updated);
      showNotification('Slot updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update slot', 'error');
    }
  };

  const removeSlot = async (slotId: string) => {
    if (!timetable) return;
    try {
      const updated = await timetableService.removeSlot(timetable.id, slotId);
      setTimetable(updated);
      showNotification('Slot removed successfully', 'success');
    } catch (error) {
      showNotification('Failed to remove slot', 'error');
    }
  };

  return { timetable, loading, addSlot, updateSlot, removeSlot };
};
```

### useConflicts Hook

```typescript
// hooks/useConflicts.ts

export const useConflicts = () => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const data = await conflictService.getConflicts();
        setConflicts(data);
      } catch (error) {
        showNotification('Failed to load conflicts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, []);

  const resolveConflict = async (id: string, resolution: string) => {
    try {
      const updated = await conflictService.resolveConflict(id, resolution);
      setConflicts(prev => prev.filter(c => c.id !== id));
      showNotification('Conflict resolved', 'success');
    } catch (error) {
      showNotification('Failed to resolve conflict', 'error');
    }
  };

  const autoResolve = async (id: string) => {
    try {
      const updated = await conflictService.autoResolve(id);
      setConflicts(prev => prev.filter(c => c.id !== id));
      showNotification('Conflict auto-resolved', 'success');
    } catch (error) {
      showNotification('Auto-resolution failed', 'error');
    }
  };

  return { conflicts, loading, resolveConflict, autoResolve };
};
```

---

## Clean Code Standards

### TypeScript Best Practices

✅ **DO:**
- Use `Readonly` for all props interfaces
- Export types from `types/` index
- Use `Readonly<Array<T>>` instead of `T[]` for immutable collections
- Define strict types, avoid `any`
- Use discriminated unions for complex states

❌ **DON'T:**
- Mix mutable and immutable patterns
- Use `string | number | boolean` (create proper types)
- Omit type definitions in complex functions
- Use `Object` or `Record<string, any>`

### Component Best Practices

✅ **DO:**
- Split large components into smaller ones
- Use custom hooks for complex logic
- Memoize expensive computations
- Prop drilling → Context/State management for > 3 levels
- Use React.memo for frequently re-rendered components

❌ **DON'T:**
- Create 500+ line components
- Mix business logic with presentation
- Hardcode configuration values
- Create multiple variations of components (use variants)
- Use context for frequently changing values

### Styling Best Practices

✅ **DO:**
- Use Tailwind utility classes
- Create reusable class combinations via CSS modules or template strings
- Reference `tailwind.config.ts` for all values
- Use semantic naming: `text-primary`, `bg-success`, `border-error`

❌ **DON'T:**
- Use inline `style` props
- Mix Tailwind and CSS modules
- Create arbitrary pixel values
- Override theme values directly in components

### File Organization

✅ **DO:**
- One component per file
- Group related features in folders
- Export types with components
- Use index.ts for folder exports
- Keep files < 300 lines

❌ **DON'T:**
- Multiple components in one file
- Scattered type definitions
- Nested folders > 3 levels deep

---

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Validation

```bash
# Validate component structure
npm run validate <file_path>

# Check architecture compliance
npm run check-architecture

# Test timetable logic
npm run test:timetable

# Full test suite
npm run test
```

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Preview production build
npm run preview
```

---

## Common Patterns and Anti-Patterns

### ✅ Correct: Modular Timetable Component

```typescript
// ✅ GOOD
export const WeeklyGrid: React.FC<Readonly<WeeklyGridProps>> = (props) => (
  <div className="grid grid-cols-7">
    <TimeSlotColumn />
    {props.timetable.slots.map(slot => (
      <SubjectBlock key={slot.id} slot={slot} />
    ))}
  </div>
);

export const SubjectBlock: React.FC<Readonly<SubjectBlockProps>> = ({
  slot,
}) => {
  const height = getSlotHeight(slot.startTime, slot.endTime);
  return <div className={height}>...</div>;
};

// Utilities separated
const getSlotHeight = (start: string, end: string): string => {
  // calculation
};
```

### ❌ Incorrect: Monolithic Component

```typescript
// ❌ BAD
export const WeeklyGrid: React.FC<{ slots: TimetableSlot[] }> = ({ slots }) => (
  <div className="grid grid-cols-7">
    {/* Everything inline */}
    <div className="flex flex-col">
      {['07:00', '07:30', /* ... */].map(time => (
        <div key={time} style={{ height: '60px' }}>
          {time}
        </div>
      ))}
    </div>
    {slots.map(slot => (
      <div
        key={slot.id}
        style={{
          height: `${((timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)) / 30) * 60}px`,
        }}
      >
        {slot.subject.name}
      </div>
    ))}
  </div>
);
```

### ✅ Correct: Role-Based Access

```typescript
// ✅ GOOD
const AdminContent = () => (
  <ProtectedFeature feature="manage_users">
    <UserManagementPanel />
  </ProtectedFeature>
);
```

### ❌ Incorrect: Scattered Permissions

```typescript
// ❌ BAD
const AdminContent = () => {
  const { user } = useAuth();
  
  return (
    <>
      {user.role === 'admin' && <AdminPanel1 />}
      {user.role === 'admin' && <AdminPanel2 />}
      {user.role === 'admin' && <AdminPanel3 />}
    </>
  );
};
```

---

## Validation Checklist

Before committing components:

- [ ] TypeScript: All props have `Readonly` interface
- [ ] Props: No prop drilling beyond 3 levels
- [ ] Types: All types exported from `types/index.ts`
- [ ] Styles: No inline styles, only Tailwind utilities
- [ ] Data: No hardcoded strings/values in components
- [ ] Logic: Business logic in hooks or utils, not components
- [ ] Performance: Memoized expensive computations
- [ ] Tests: Unit tests for utilities and hooks
- [ ] Docs: Component has JSDoc comments if non-obvious
- [ ] Linting: `npm run lint` passes
- [ ] Type checking: `npm run type-check` passes
- [ ] Naming: Clear, descriptive file and function names
- [ ] Size: File < 300 lines
- [ ] Accessibility: ARIA labels where appropriate
- [ ] Mobile: Responsive Tailwind classes

---

## Troubleshooting

### Timetable Grid Issues

**Issue**: Subject blocks overlap or misalign
- **Solution**: Verify `calculateTopOffset` uses correct base time (07:00)
- **Check**: Ensure `getSlotHeight` divides by 30 correctly
- **Test**: Use mock data with known times (08:00–09:00 = h-[120px])

**Issue**: Time slots not displaying correctly
- **Solution**: Verify `generateTimeSlots()` includes all hours
- **Check**: Confirm slot height matches grid template

### Conflict Detection Issues

**Issue**: False positive conflict detection
- **Solution**: Verify `hasTimeOverlap` logic (open interval vs closed)
- **Check**: Ensure same-day check before time comparison
- **Test**: Use unit tests with known overlap scenarios

### Permission Issues

**Issue**: Users seeing unauthorized features
- **Solution**: Verify role assignments in mock data
- **Check**: Confirm `ProtectedRoute` middleware is applied
- **Test**: Test each role separately with mock data

---

## Resources

- [Timetable Grid CSS Reference](#)
- [React Hook Patterns](#)
- [TypeScript React Guidelines](#)
- [Tailwind Responsive Design](#)
- [Conflict Detection Algorithms](#)
- [Role-Based Access Control (RBAC)](#)

---

**Last Updated**: April 17, 2026
**Maintainer**: Frontend Team
