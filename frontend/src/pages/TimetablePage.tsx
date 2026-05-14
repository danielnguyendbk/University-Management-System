import React, { useState } from 'react'
import { DashboardLayout } from '../components/layouts/DashboardLayout'
import { WeeklyGrid } from '../components/timetable/WeeklyGrid'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import type { UserRole } from '../types'
import { mockTimetables } from '../data/mockTimetables'

interface TimetablePageProps {
  readonly userRole: UserRole
  readonly userName?: string
}

export const TimetablePage: React.FC<Readonly<TimetablePageProps>> = ({
  userRole,
  userName = 'User',
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const timetable = mockTimetables[0]

  const selectedSlot = timetable?.slots.find(s => s.id === selectedSlotId)

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-600 mt-2">
            View and manage your schedule for the week
          </p>
        </div>

        {/* Week Info */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Week {timetable?.weekNumber}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {timetable?.startDate} to {timetable?.endDate}
              </p>
            </div>
            <Badge
              label={timetable?.isPublished ? 'Published' : 'Draft'}
              variant={timetable?.isPublished ? 'success' : 'default'}
            />
          </div>
        </Card>

        {/* Timetable Grid */}
        {timetable && (
          <WeeklyGrid
            timetable={timetable}
            onSubjectClick={setSelectedSlotId}
          />
        )}

        {/* Details Panel */}
        {selectedSlot && (
          <Card className="border-2 border-blue-500">
            <h3 className="font-bold text-lg mb-4">Slot Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Subject</p>
                <p className="font-bold">{selectedSlot.subject.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Code</p>
                <p className="font-bold">{selectedSlot.subject.code}</p>
              </div>
              <div>
                <p className="text-gray-600">Lecturer</p>
                <p className="font-bold">{selectedSlot.lecturer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Classroom</p>
                <p className="font-bold">{selectedSlot.classroom.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-bold">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Day</p>
                <p className="font-bold">{selectedSlot.dayOfWeek}</p>
              </div>
            </div>
            {selectedSlot.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-900">Notes:</p>
                <p className="text-sm text-gray-600">{selectedSlot.notes}</p>
              </div>
            )}
            <button
              onClick={() => setSelectedSlotId(null)}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
