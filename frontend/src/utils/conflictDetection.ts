import type { Conflict, TimetableSlot } from '../types'
import { hasTimeOverlap } from './timeSlots'

// Detect conflicts in timetable
export const detectConflicts = (slots: readonly TimetableSlot[]): readonly Conflict[] => {
  const conflicts: Conflict[] = []
  const seen = new Set<string>()

  // Check classroom double booking
  const classroomMap = new Map<string, TimetableSlot[]>()
  slots.forEach(slot => {
    if (!classroomMap.has(slot.classroom.id)) {
      classroomMap.set(slot.classroom.id, [])
    }
    classroomMap.get(slot.classroom.id)?.push(slot)
  })

  classroomMap.forEach((classSlots, classroomId) => {
    for (let i = 0; i < classSlots.length; i++) {
      for (let j = i + 1; j < classSlots.length; j++) {
        const overlap = hasTimeOverlap(
          classSlots[i].dayOfWeek,
          classSlots[i].startTime,
          classSlots[i].endTime,
          classSlots[j].dayOfWeek,
          classSlots[j].startTime,
          classSlots[j].endTime
        )

        if (overlap) {
          const conflictId = `classroom_${classroomId}_${i}_${j}`
          if (!seen.has(conflictId)) {
            seen.add(conflictId)
            conflicts.push({
              id: conflictId,
              type: 'classroom_double_booking',
              severity: 'high',
              affectedSlots: [classSlots[i], classSlots[j]],
              description: `Classroom "${classSlots[i].classroom.name}" booked twice: ${classSlots[i].dayOfWeek} and ${classSlots[j].dayOfWeek}`,
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }
  })

  // Check lecturer double booking
  const lecturerMap = new Map<string, TimetableSlot[]>()
  slots.forEach(slot => {
    if (!lecturerMap.has(slot.lecturer.id)) {
      lecturerMap.set(slot.lecturer.id, [])
    }
    lecturerMap.get(slot.lecturer.id)?.push(slot)
  })

  lecturerMap.forEach((lecSlots, lecturerId) => {
    for (let i = 0; i < lecSlots.length; i++) {
      for (let j = i + 1; j < lecSlots.length; j++) {
        const overlap = hasTimeOverlap(
          lecSlots[i].dayOfWeek,
          lecSlots[i].startTime,
          lecSlots[i].endTime,
          lecSlots[j].dayOfWeek,
          lecSlots[j].startTime,
          lecSlots[j].endTime
        )

        if (overlap) {
          const conflictId = `lecturer_${lecturerId}_${i}_${j}`
          if (!seen.has(conflictId)) {
            seen.add(conflictId)
            conflicts.push({
              id: conflictId,
              type: 'lecturer_double_booking',
              severity: 'high',
              affectedSlots: [lecSlots[i], lecSlots[j]],
              description: `Lecturer "${lecSlots[i].lecturer.name}" has conflicting classes`,
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }
  })

  return conflicts
}
