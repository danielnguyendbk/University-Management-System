import React from 'react'
import { generateTimeSlots, SLOT_HEIGHT_PX } from '../../utils/timeSlots'

export const TimeSlotColumn: React.FC = () => {
  const timeSlots = generateTimeSlots()

  return (
    <div className="flex flex-col bg-gray-50 border-r border-gray-200 w-20 flex-shrink-0">
      <div className="h-12 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600">Time</span>
      </div>
      {timeSlots.map((time, idx) => (
        <div
          key={`${time}-${idx}`}
          className="border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0"
          style={{ height: `${SLOT_HEIGHT_PX}px` }}
        >
          {time}
        </div>
      ))}
    </div>
  )
}
