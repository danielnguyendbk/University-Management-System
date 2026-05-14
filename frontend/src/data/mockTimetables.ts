import type { WeeklyTimetable } from '../types'
import { mockSubjects, mockUsers, mockClassrooms } from './mockBasic'

// Mock Timetables with proper time slots
export const mockTimetables: readonly WeeklyTimetable[] = [
  {
    id: 'timetable_1',
    weekNumber: 1,
    startDate: '2026-04-20',
    endDate: '2026-04-26',
    slots: [
      // Monday morning
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
      // Monday afternoon
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
      // Tuesday morning
      {
        id: 'slot_3',
        dayOfWeek: 'Tuesday',
        startTime: '08:00',
        endTime: '09:30',
        duration: 90,
        subject: mockSubjects[2],
        lecturer: mockUsers[1],
        classroom: mockClassrooms[2],
      },
      // Tuesday evening
      {
        id: 'slot_4',
        dayOfWeek: 'Tuesday',
        startTime: '18:00',
        endTime: '19:30',
        duration: 90,
        subject: mockSubjects[3],
        lecturer: mockUsers[2],
        classroom: mockClassrooms[0],
      },
      // Wednesday morning
      {
        id: 'slot_5',
        dayOfWeek: 'Wednesday',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        subject: mockSubjects[0],
        lecturer: mockUsers[1],
        classroom: mockClassrooms[3],
      },
      // Wednesday afternoon
      {
        id: 'slot_6',
        dayOfWeek: 'Wednesday',
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        subject: mockSubjects[1],
        lecturer: mockUsers[2],
        classroom: mockClassrooms[1],
      },
      // Thursday morning
      {
        id: 'slot_7',
        dayOfWeek: 'Thursday',
        startTime: '07:30',
        endTime: '09:00',
        duration: 90,
        subject: mockSubjects[2],
        lecturer: mockUsers[1],
        classroom: mockClassrooms[0],
      },
      // Thursday afternoon
      {
        id: 'slot_8',
        dayOfWeek: 'Thursday',
        startTime: '13:30',
        endTime: '15:00',
        duration: 90,
        subject: mockSubjects[3],
        lecturer: mockUsers[2],
        classroom: mockClassrooms[2],
      },
      // Friday morning
      {
        id: 'slot_9',
        dayOfWeek: 'Friday',
        startTime: '08:30',
        endTime: '10:00',
        duration: 90,
        subject: mockSubjects[0],
        lecturer: mockUsers[1],
        classroom: mockClassrooms[1],
      },
      // Saturday morning
      {
        id: 'slot_10',
        dayOfWeek: 'Saturday',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        subject: mockSubjects[1],
        lecturer: mockUsers[2],
        classroom: mockClassrooms[3],
      },
    ],
    isPublished: true,
    createdAt: '2026-04-17T00:00:00Z',
    updatedAt: '2026-04-17T00:00:00Z',
  },
]
