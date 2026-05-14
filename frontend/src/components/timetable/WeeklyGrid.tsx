import React from 'react'
import { DAYS_OF_WEEK, SLOT_HEIGHT_PX, generateTimeSlots, getDayColor } from '../../utils/timeSlots'
import { SubjectBlock } from './SubjectBlock'
import { TimeSlotColumn } from './TimeSlotColumn'
import type { WeeklyTimetable } from '../../types'

interface WeeklyGridProps {
  readonly timetable: WeeklyTimetable
  readonly onSubjectClick?: (slotId: string) => void
}

export const WeeklyGrid: React.FC<Readonly<WeeklyGridProps>> = ({
  timetable,
  onSubjectClick,
}) => {
  const timeSlots = generateTimeSlots()

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex">
          {/* Time slot column */}
          <TimeSlotColumn />

          {/* Day columns */}
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className={`flex-1 border-r border-gray-200 ${getDayColor(day)}`}
            >
              {/* Day header */}
              <div className="h-12 border-b border-gray-200 flex items-center justify-center sticky top-0 bg-white bg-opacity-95 font-bold text-gray-900">
                {day}
              </div>

              {/* Time grid */}
              <div className="relative">
                {timeSlots.map((time, idx) => (
                  <div
                    key={`${day}-${time}-${idx}`}
                    className="border-b border-gray-200 flex-shrink-0 relative"
                    style={{ height: `${SLOT_HEIGHT_PX}px` }}
                  >
                    {/* Grid lines */}
                  </div>
                ))}

                {/* Subject blocks - overlay on top */}
                {timetable.slots
                  .filter(slot => slot.dayOfWeek === day)
                  .map(slot => (
                    <SubjectBlock
                      key={slot.id}
                      slot={slot}
                      onClick={() => onSubjectClick?.(slot.id)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Time Slots:</strong> Morning (07:00-10:30) | Afternoon (13:00-16:30) | Evening (18:00-21:30)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Grid Size:</strong> 30-minute intervals
        </p>
      </div>
    </div>
  )
}
