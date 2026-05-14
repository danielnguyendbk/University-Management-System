# University Timetable Management Portal

A complete React + Vite + Tailwind CSS web application for managing university classroom schedules, approvals, and conflict resolution.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

```bash
# Navigate to project directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

The application will start with a role selector. Choose a role to demo:
- **Admin**: Full system access, user management, approvals, conflicts
- **Lecturer**: Schedule lessons, view timetables, request classrooms
- **Student**: View personal timetable, enroll in subjects
- **Staff**: Support users, manage approvals, resolve conflicts

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
├── index.css              # Global styles
├── types/                 # TypeScript type definitions
│   ├── user.ts
│   ├── timetable.ts
│   ├── approval.ts
│   ├── conflict.ts
│   └── index.ts
├── data/                  # Mock data
│   ├── mockBasic.ts       # Users, classrooms, subjects
│   ├── mockTimetables.ts  # Weekly timetables with time slots
│   ├── mockApprovals.ts   # Approval requests
│   └── mockConflicts.ts   # Detected conflicts
├── utils/                 # Utility functions
│   ├── timeSlots.ts       # Timetable grid calculations
│   ├── conflictDetection.ts
│   └── permissions.ts     # Role-based access control
├── components/            # Reusable React components
│   ├── common/            # Generic components (Button, Card, Badge, Modal)
│   ├── layouts/           # Layout components (Header, Sidebar, DashboardLayout)
│   ├── timetable/         # Timetable-specific (WeeklyGrid, SubjectBlock, TimeSlotColumn)
│   ├── dashboard/         # Dashboard components (StatCard, ActivityFeed)
│   ├── approval/          # Approval components (ApprovalCard, ApprovalList)
│   └── conflict/          # Conflict components (ConflictCard, ConflictList)
├── pages/                 # Page components
│   ├── DashboardPage.tsx
│   ├── TimetablePage.tsx
│   ├── ApprovalCenterPage.tsx
│   └── ConflictCenterPage.tsx
├── hooks/                 # Custom React hooks (future expansion)
└── context/               # React Context (future expansion)
```

## 🎯 Features Implemented

### 1. **Weekly Timetable Grid** ✅
- **Time Slots**: 30-minute intervals throughout the day
  - Morning: 07:00–10:30
  - Afternoon: 13:00–16:30
  - Evening: 18:00–21:30
- **Grid Display**:
  - Left side: Time labels in 30-minute increments
  - Top: 6 days of the week (Monday–Saturday)
  - Blocks: Subject classes positioned by actual start/end time
- **Interactive**: Click any subject block to view details

### 2. **Admin Dashboard** ✅
- System statistics (total classes, approvals, conflicts)
- Quick access to all management features
- Activity feed showing recent system events
- Statistics cards with trend indicators

### 3. **Approval Center** ✅
- Filter approvals by status (pending, approved, rejected)
- Review approval requests with full content
- Approve/reject actions with comments
- Statistics dashboard

### 4. **Conflict Center** ✅
- Detect and display scheduling conflicts
  - Classroom double bookings
  - Lecturer overlapping schedules
  - Student time conflicts
- Severity levels (high, medium, low)
- Mark conflicts as resolved
- View affected time slots

### 5. **Reusable Components** ✅
- **Button**: Multiple variants (primary, secondary, danger, success) and sizes
- **Card**: Versatile container with optional hover effects
- **Badge**: Status indicators with color coding
- **Modal**: Reusable dialog component
- **Loading**: Spinner and overlay components
- **Header & Sidebar**: Navigation with role-based access
- **Layout**: DashboardLayout combining header and sidebar

### 6. **Role-Based Access Control** ✅
- Permission system for each role
- Accessible pages vary by role
- Components check permissions before rendering
- Role selector on app start

### 7. **Mock Data** ✅
- 5 sample users (admin, 2 lecturers, student, staff)
- 4 classrooms with varying capacities
- 4 subjects across Computer Science department
- 10 timetable slots properly distributed across the week
- 4 approval requests at various stages
- 3 sample conflicts of different types

## 🛠 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling |
| **React Router v6** | Client-side routing |
| **Zod** | Schema validation (ready to use) |

## 📋 Timetable Grid Rules

### Time Slot System
- **Base Duration**: 30-minute slots
- **Total Slots**: 21 per day (7 morning + 7 afternoon + 7 evening)
- **Grid Height**: 60px per slot
- **Layout**: Subject blocks positioned absolutely by calculated start/end time

### Calculation Helpers
```typescript
// Get subject block height based on duration
getSlotHeight(startTime, endTime) // Returns h-[120px] for 60-min class

// Get position from top of grid
calculateTopOffset(startTime) // Returns top-[60px] for 07:30 start

// Check time overlaps
hasTimeOverlap(day1, start1, end1, day2, start2, end2)
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Subject Color Coding
Subject blocks in timetable are colored by subject code (5-color rotation):
- Blue, Purple, Pink, Green, Yellow

## 👥 User Roles & Permissions

### Admin
- View all timetables
- Manage users
- Manage classrooms
- Manage subjects
- Approve/reject requests
- Resolve conflicts

### Lecturer
- Schedule lessons
- Request classrooms
- View assigned timetable
- View student lists
- Submit approval requests

### Student
- View personal timetable
- Enroll in subjects
- View lecturer information

### Staff
- Support users
- Approve requests
- Resolve conflicts
- Bulk operations

## 🔄 Approval Workflow

1. **Pending**: Awaiting review
2. **Approved**: Request accepted
3. **Rejected**: Request denied

Types:
- `timetable_change`: Reschedule requests
- `classroom_booking`: Room reservation
- `subject_addition`: New subject addition

## ⚠️ Conflict Detection

### Types
- **Classroom Double Booking**: Same room, overlapping times
- **Lecturer Double Booking**: Same lecturer, overlapping times
- **Student Time Overlap**: Student enrolled twice at same time

### Severity Levels
- **High**: Critical (blocking), requires immediate resolution
- **Medium**: Important, should be addressed soon
- **Low**: Minor, can be addressed later

## 📦 Component Usage Examples

### Using WeeklyGrid
```tsx
import { WeeklyGrid } from './components/timetable/WeeklyGrid'

<WeeklyGrid
  timetable={timetable}
  userRole="lecturer"
  onSubjectClick={(slotId) => console.log(slotId)}
/>
```

### Using ApprovalList
```tsx
import { ApprovalList } from './components/approval/ApprovalList'

<ApprovalList
  approvals={approvals}
  onApprove={(id) => handleApprove(id)}
  onReject={(id) => handleReject(id)}
/>
```

### Using ConflictList
```tsx
import { ConflictList } from './components/conflict/ConflictList'

<ConflictList
  conflicts={conflicts}
  onResolve={(id) => handleResolve(id)}
/>
```

## 🧪 Mock Data Examples

### Creating a Timetable Slot
```typescript
const slot: TimetableSlot = {
  id: 'slot_1',
  dayOfWeek: 'Monday',
  startTime: '07:00',
  endTime: '08:30',
  duration: 90,
  subject: mockSubjects[0],
  lecturer: mockUsers[1],
  classroom: mockClassrooms[0],
}
```

### Creating an Approval
```typescript
const approval: ApprovalRequest = {
  id: 'approval_1',
  type: 'timetable_change',
  requester: mockUsers[1],
  content: { reason: 'Need to reschedule' },
  status: 'pending',
  assignedTo: mockUsers[0],
  comments: [],
  createdAt: new Date().toISOString(),
}
```

## 🚀 Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Authentication system
- [ ] Real database (PostgreSQL/MongoDB)
- [ ] Export to calendar formats (ICS, PDF)
- [ ] Email notifications
- [ ] Advanced conflict resolution algorithms
- [ ] Student enrollment system
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app version

## 📚 Related Documentation

- **DESIGN.md**: Design system and Stitch integration guidelines
- **SKILL.md**: Comprehensive architecture and development standards
- **.env.example**: Environment variable template

## 🤝 Development Notes

### Type Safety
- All components use TypeScript interfaces with `Readonly<>` for props
- No `any` types used
- Strict mode enabled in tsconfig.json

### Code Organization
- One component per file
- Utilities in separate files
- Mock data separated by domain
- Types exported from `types/index.ts`

### Styling
- Tailwind CSS utilities only
- No inline styles
- Responsive design with mobile-first approach
- Dark mode ready (colors defined in tailwind.config.ts)

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Dev server not starting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Timetable grid not displaying properly
- Check that `SLOT_HEIGHT_PX` is 60 in utils/timeSlots.ts
- Verify time slot calculations in browser devtools
- Ensure mock data has valid time formats (HH:mm)

### Components not rendering
- Check browser console for TypeScript errors
- Verify mock data imports
- Ensure all types are imported correctly

## 👨‍💻 Support

For issues or questions:
1. Check the SKILL.md for architectural details
2. Review component examples in pages/
3. Inspect mock data for data structure examples

---

**Project Status**: ✅ Complete & Runnable
**Last Updated**: April 17, 2026
**Version**: 0.1.0
