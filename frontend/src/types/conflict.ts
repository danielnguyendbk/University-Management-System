import type { TimetableSlot } from './timetable'

// Conflict domain types
export type ConflictType = 
  | 'classroom_double_booking' 
  | 'lecturer_double_booking' 
  | 'student_time_overlap'
  | 'unavailable_time'

export interface Conflict {
  readonly id: string
  readonly type: ConflictType
  readonly severity: 'low' | 'medium' | 'high'
  readonly affectedSlots: readonly TimetableSlot[]
  readonly description: string
  readonly resolvedAt?: string
  readonly resolutionNotes?: string
  readonly createdAt: string
}
