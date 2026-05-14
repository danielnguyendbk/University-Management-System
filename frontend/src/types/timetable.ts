import type { User, Classroom, Subject } from './user'

// Timetable domain types
export type TimeSlotPeriod = 'morning' | 'afternoon' | 'evening'
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export interface TimeRange {
  readonly startTime: string
  readonly endTime: string
}

export interface TimetableSlot {
  readonly id: string
  readonly dayOfWeek: DayOfWeek
  readonly startTime: string
  readonly endTime: string
  readonly duration: number
  readonly subject: Subject
  readonly lecturer: User
  readonly classroom: Classroom
  readonly notes?: string
}

export interface WeeklyTimetable {
  readonly id: string
  readonly weekNumber: number
  readonly startDate: string
  readonly endDate: string
  readonly slots: readonly TimetableSlot[]
  readonly isPublished: boolean
  readonly createdAt: string
  readonly updatedAt: string
}
