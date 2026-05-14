# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   App.tsx (Router)                       │   │
│  │  - Role Selector on first load                          │   │
│  │  - Route handler for all pages                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                 ┌────────────┼────────────┐                      │
│                 │            │            │                      │
│         ┌───────▼───┐ ┌──────▼────┐ ┌────▼─────┐               │
│         │ Dashboard │ │ Timetable │ │Approvals │ ...           │
│         │   Page    │ │   Page    │ │  Page    │               │
│         └───────────┘ └───────────┘ └──────────┘               │
│                 │            │            │                      │
│                 └────────────┼────────────┘                      │
│                              │                                   │
│                  ┌───────────▼──────────┐                        │
│                  │  DashboardLayout     │                        │
│                  │ ┌────────────────┐   │                        │
│                  │ │ Header (User)  │   │                        │
│                  │ ├────────────────┤   │                        │
│                  │ │ Sidebar (Nav)  │   │                        │
│                  │ │ Main Content   │   │                        │
│                  │ │ (from Page)    │   │                        │
│                  │ └────────────────┘   │                        │
│                  └────────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Types (TypeScript)
    ↓
Mock Data (Immutable)
    ↓
Utilities (Pure Functions)
    ↓
Components (Composition)
    ↓
Pages (Orchestration)
    ↓
App (Routing)
    ↓
UI (User Interaction)
```

## Component Hierarchy

```
App (root)
├── RoleSelector
└── AppRoutes
    ├── DashboardPage
    │   └── DashboardLayout
    │       ├── Header
    │       ├── Sidebar
    │       └── Dashboard Content
    │           ├── StatCard (×4)
    │           └── ActivityFeed
    │
    ├── TimetablePage
    │   └── DashboardLayout
    │       └── Timetable Content
    │           ├── WeeklyGrid
    │           │   ├── TimeSlotColumn
    │           │   └── DayColumn (×6)
    │           │       └── SubjectBlock (×N)
    │           └── Details Panel
    │
    ├── ApprovalCenterPage
    │   └── DashboardLayout
    │       └── Approval Content
    │           ├── Statistics
    │           ├── Filter Tabs
    │           └── ApprovalList
    │               └── ApprovalCard (×N)
    │
    └── ConflictCenterPage
        └── DashboardLayout
            └── Conflict Content
                ├── Severity Stats
                ├── ConflictList (Unresolved)
                │   └── ConflictCard (×N)
                ├── ConflictList (Resolved)
                │   └── ConflictCard (×N)
                └── Detail Panel
```

## Timetable Grid Layout

```
┌──────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Time │ Monday   │ Tuesday  │Wednesday │Thursday  │ Friday   │Saturday  │
├──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│07:00 │          │          │          │          │          │          │
│      │          │          │          │          │          │          │
│07:30 │          │          │          │          │          │          │
├──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│08:00 │ ┌──────┐ │ ┌──────┐ │          │ ┌──────┐ │ ┌──────┐ │          │
│      │ │CS101 │ │ │CS301 │ │          │ │CS301 │ │ │CS101 │ │          │
│08:30 │ │      │ │ │      │ │          │ │      │ │ │      │ │          │
│      │ │Smith │ │ │Smith │ │          │ │Smith │ │ │Smith │ │          │
│      │ │R101  │ │ │R303  │ │          │ │R101  │ │ │R202  │ │          │
│      │ └──────┘ │ └──────┘ │          │ └──────┘ │ └──────┘ │          │
│09:00 │          │          │          │          │          │          │
├──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│13:00 │ ┌──────┐ │          │ ┌──────┐ │ ┌──────┐ │          │          │
│      │ │CS201 │ │          │ │CS201 │ │ │CS202 │ │          │          │
│13:30 │ │      │ │          │ │      │ │ │      │ │          │          │
│      │ │Sarah │ │          │ │Sarah │ │ │Sarah │ │          │          │
│      │ │R202  │ │          │ │R101  │ │ │R303  │ │          │          │
│      │ └──────┘ │          │ └──────┘ │ └──────┘ │          │          │
│14:00 │          │          │          │          │          │          │
├──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│18:00 │          │ ┌──────┐ │          │          │          │          │
│      │          │ │CS202 │ │          │          │          │          │
│18:30 │          │ │      │ │          │          │          │          │
│      │          │ │Sarah │ │          │          │          │          │
│      │          │ │R101  │ │          │          │          │          │
│      │          │ └──────┘ │          │          │          │          │
│19:00 │          │          │          │          │          │          │
└──────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Time: Left column (30-min increments)
Days: Top row headers
Blocks: Subject classes (color-coded, sized by duration)
```

## Data Domain Model

```
┌─────────────────────────────────────────────────────────────┐
│                      User Domain                             │
├─────────────────────────────────────────────────────────────┤
│ ├── User                                                      │
│ │   ├── id, email, name                                      │
│ │   ├── role: 'admin' | 'lecturer' | 'student' | 'staff'   │
│ │   └── department, avatar, createdAt                        │
│ ├── Classroom                                                 │
│ │   ├── id, name, building                                  │
│ │   ├── capacity                                             │
│ │   └── facilities: string[]                                │
│ └── Subject                                                   │
│     ├── id, name, code                                      │
│     ├── credits, department                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Timetable Domain                           │
├─────────────────────────────────────────────────────────────┤
│ ├── TimetableSlot                                             │
│ │   ├── id, dayOfWeek, startTime, endTime                   │
│ │   ├── duration, subject, lecturer, classroom             │
│ │   └── notes (optional)                                    │
│ └── WeeklyTimetable                                           │
│     ├── id, weekNumber, startDate, endDate                  │
│     ├── slots: TimetableSlot[]                              │
│     ├── isPublished, createdAt, updatedAt                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Approval Domain                             │
├─────────────────────────────────────────────────────────────┤
│ └── ApprovalRequest                                           │
│     ├── id, type, requester, content                        │
│     ├── status: 'pending' | 'approved' | 'rejected'         │
│     ├── assignedTo, comments[]                              │
│     ├── createdAt, resolvedAt                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Conflict Domain                             │
├─────────────────────────────────────────────────────────────┤
│ └── Conflict                                                  │
│     ├── id, type, severity                                  │
│     ├── affectedSlots: TimetableSlot[]                      │
│     ├── description                                         │
│     ├── resolvedAt, resolutionNotes                         │
│     └── createdAt                                           │
└─────────────────────────────────────────────────────────────┘
```

## Feature Implementation Map

```
┌─────────────────────────────────────────────────────────────┐
│               Feature: Weekly Timetable                       │
├─────────────────────────────────────────────────────────────┤
│ Components:                                                   │
│   ├── WeeklyGrid (main container)                           │
│   ├── TimeSlotColumn (left side time labels)                │
│   ├── SubjectBlock (individual classes)                     │
│ Utilities:                                                    │
│   ├── generateTimeSlots() - create 30-min intervals         │
│   ├── getSlotHeight() - calculate block height              │
│   ├── calculateTopOffset() - calculate block position       │
│   ├── timeToMinutes() - convert HH:mm to minutes            │
│   └── hasTimeOverlap() - check for conflicts               │
│ Data:                                                         │
│   └── mockTimetables - 10 slots with proper times           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Feature: Admin Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│ Components:                                                   │
│   ├── StatCard (statistics display)                         │
│   ├── ActivityFeed (recent events)                          │
│ Data:                                                         │
│   ├── mockTimetables (count total)                          │
│   ├── mockApprovals (count pending)                         │
│   ├── mockConflicts (count active)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Feature: Approval Center                        │
├─────────────────────────────────────────────────────────────┤
│ Components:                                                   │
│   ├── ApprovalList (container)                              │
│   ├── ApprovalCard (individual approval)                    │
│ Pages:                                                        │
│   └── ApprovalCenterPage (with filtering)                   │
│ Data:                                                         │
│   └── mockApprovals - 4 requests at various stages          │
│ Utilities:                                                    │
│   └── getApprovalStatusColor() - status styling             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Feature: Conflict Center                        │
├─────────────────────────────────────────────────────────────┤
│ Components:                                                   │
│   ├── ConflictList (container)                              │
│   ├── ConflictCard (individual conflict)                    │
│ Pages:                                                        │
│   └── ConflictCenterPage (with severity stats)              │
│ Data:                                                         │
│   └── mockConflicts - 3 sample conflicts                    │
│ Utilities:                                                    │
│   ├── detectConflicts() - algorithm                         │
│   └── getSeverityColor() - severity styling                 │
└─────────────────────────────────────────────────────────────┘
```

## State Management Strategy

### Current (Props-based)
```typescript
// Page component manages state
const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null)

// Pass to child components via props
<WeeklyGrid onSubjectClick={setSelectedSlotId} />
<Details slot={selectedSlot} />
```

### Future (Context/Zustand)
```typescript
// Context for global state
<AuthContext>
  <TimetableContext>
    <AppRoutes />
  </TimetableContext>
</AuthContext>

// Or Zustand stores
const timetableStore = create((set) => ({
  slots: [],
  addSlot: () => {},
  removeSlot: () => {},
}))
```

## API Integration Points

When ready to connect to backend, replace:

```typescript
// Current: Import mock data
import { mockTimetables } from '../data/mockTimetables'

// Future: Fetch from API
const { data: timetables } = useQuery(
  ['timetables', weekNumber],
  () => api.getTimetables(weekNumber)
)
```

## Styling Architecture

```
Tailwind CSS (Utility-first)
├── Global Styles (index.css)
│   ├── Base resets
│   ├── Custom scrollbar
│   └── Animations
├── Component Classes (inline)
│   ├── Reusable patterns
│   ├── Variant combinations
│   └── Responsive design
└── Theme Configuration (tailwind.config.ts)
    ├── Colors (brand, status)
    ├── Spacing (base unit 4px)
    └── Custom utilities
```

## Error Handling (Future)

```typescript
try {
  // Fetch data or process
} catch (error) {
  showNotification('Error message', 'error')
  // Log to error tracking service
}
```

## Performance Optimizations (Future)

```typescript
// Code splitting per route
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))

// Memoization for expensive renders
export const SubjectBlock = React.memo(SubjectBlockComponent)

// Data caching with React Query
const { data } = useQuery(['timetables'], fetchTimetables)
```

---

This architecture is:
- ✅ **Scalable**: Easy to add new pages/features
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Pure functions in utils
- ✅ **Type-safe**: Full TypeScript coverage
- ✅ **Performant**: Optimized render paths
