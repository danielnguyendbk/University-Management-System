import type { Conflict } from '../types'
import { mockTimetables } from './mockTimetables'

// Mock Conflicts
export const mockConflicts: readonly Conflict[] = [
  {
    id: 'conflict_1',
    type: 'classroom_double_booking',
    severity: 'high',
    affectedSlots: [mockTimetables[0].slots[0], mockTimetables[0].slots[2]],
    description: 'Room 101 is booked twice on Monday 07:00-08:30 and Tuesday 08:00-09:30',
    createdAt: '2026-04-16T08:00:00Z',
  },
  {
    id: 'conflict_2',
    type: 'lecturer_double_booking',
    severity: 'high',
    affectedSlots: [mockTimetables[0].slots[3], mockTimetables[0].slots[4]],
    description: 'Dr. Smith has conflicting sessions on Tuesday evening and Wednesday morning',
    createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'conflict_3',
    type: 'student_time_overlap',
    severity: 'medium',
    affectedSlots: [mockTimetables[0].slots[1], mockTimetables[0].slots[5]],
    description: 'Student enrolled in two classes at overlapping times',
    createdAt: '2026-04-14T14:00:00Z',
  },
]
