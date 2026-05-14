import React from 'react'
import { calculateTopOffset, getSlotHeight } from '../../utils/timeSlots'
import type { TimetableSlot } from '../../types'

interface SubjectBlockProps {
  readonly slot: TimetableSlot
  readonly onClick?: () => void
}

export const SubjectBlock: React.FC<Readonly<SubjectBlockProps>> = ({
  slot,
  onClick,
}) => {
  const height = getSlotHeight(slot.startTime, slot.endTime)
  const top = calculateTopOffset(slot.startTime)

  // Color mapping for subjects (simple rotation)
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
  ]
  const colorIndex = slot.subject.code.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      className={`
        absolute ${height} ${top} left-0 right-0 mx-1
        ${bgColor} rounded p-2 text-white text-xs
        cursor-pointer hover:opacity-90 transition-opacity
        border border-opacity-50 border-white
        overflow-hidden
      `}
      onClick={onClick}
      title={`${slot.subject.name} - ${slot.startTime} to ${slot.endTime}`}
    >
      <div className="font-bold text-xs truncate">{slot.subject.code}</div>
      <div className="text-xs opacity-90 truncate">{slot.subject.name}</div>
      <div className="text-xs opacity-75 truncate">{slot.lecturer.name}</div>
      <div className="text-xs opacity-75 truncate">{slot.classroom.name}</div>
    </div>
  )
}
