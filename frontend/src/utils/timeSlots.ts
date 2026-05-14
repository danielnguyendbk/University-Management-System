import type { DayOfWeek } from '../types'

// Time slot constants (30-minute intervals)
export const TIME_SLOTS = {
  morning: {
    start: '07:00',
    end: '10:30',
    label: 'Morning',
    slotCount: 7,
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
}

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const SLOT_HEIGHT_PX = 60

// Generate all time slots in 30-minute intervals
export const generateTimeSlots = (): readonly string[] => {
  const slots: string[] = []
  const hours = [7, 8, 9, 10, 13, 14, 15, 16, 18, 19, 20, 21]

  hours.forEach(hour => {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
    slots.push(`${String(hour).padStart(2, '0')}:30`)
  })

  return slots
}

// Convert time string (HH:mm) to minutes since midnight
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Calculate CSS height for subject block based on duration
export const getSlotHeight = (startTime: string, endTime: string): string => {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const duration = endMinutes - startMinutes
  const slotCount = duration / 30
  return `h-[${slotCount * SLOT_HEIGHT_PX}px]`
}

// Calculate CSS top offset for subject block
export const calculateTopOffset = (startTime: string): string => {
  const minutes = timeToMinutes(startTime) - timeToMinutes('07:00')
  const slotCount = minutes / 30
  return `top-[${slotCount * SLOT_HEIGHT_PX}px]`
}

// Check if two time slots overlap
export const hasTimeOverlap = (
  day1: DayOfWeek,
  start1: string,
  end1: string,
  day2: DayOfWeek,
  start2: string,
  end2: string
): boolean => {
  if (day1 !== day2) return false

  const startMin1 = timeToMinutes(start1)
  const endMin1 = timeToMinutes(end1)
  const startMin2 = timeToMinutes(start2)
  const endMin2 = timeToMinutes(end2)

  return startMin1 < endMin2 && startMin2 < endMin1
}

// Get day color based on day of week (for UI)
export const getDayColor = (day: DayOfWeek): string => {
  const colors: Record<DayOfWeek, string> = {
    Monday: 'bg-blue-50',
    Tuesday: 'bg-purple-50',
    Wednesday: 'bg-pink-50',
    Thursday: 'bg-green-50',
    Friday: 'bg-yellow-50',
    Saturday: 'bg-orange-50',
  }
  return colors[day]
}

// Get conflict severity color
export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  }
  return colors[severity]
}

// Get approval status color
export const getApprovalStatusColor = (status: 'pending' | 'approved' | 'rejected'): string => {
  const colors = {
    pending: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return colors[status]
}
