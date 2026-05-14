import React from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { getSeverityColor } from '../../utils/timeSlots'
import type { Conflict } from '../../types'

interface ConflictCardProps {
  readonly conflict: Conflict
  readonly onResolve?: () => void
}

export const ConflictCard: React.FC<Readonly<ConflictCardProps>> = ({
  conflict,
  onResolve,
}) => {
  void getSeverityColor(conflict.severity)
  const isResolved = conflict.resolvedAt

  return (
    <Card
      className={`border-2 ${
        isResolved ? 'border-green-300 bg-green-50' : 'border-red-300'
      } cursor-pointer hover:shadow-lg`}
      hoverable={!isResolved}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg capitalize">
            {conflict.type.replace(/_/g, ' ')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
        </div>
        <Badge
          label={conflict.severity.toUpperCase()}
          variant={
            conflict.severity === 'high'
              ? 'danger'
              : conflict.severity === 'medium'
                ? 'warning'
                : 'primary'
          }
        />
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900 mb-2">
          Affected Slots: {conflict.affectedSlots.length}
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          {conflict.affectedSlots.map(slot => (
            <p key={slot.id}>
              {slot.dayOfWeek} {slot.startTime}-{slot.endTime}: {slot.subject.code}
            </p>
          ))}
        </div>
      </div>

      {isResolved ? (
        <div className="p-2 bg-green-100 rounded text-sm">
          <p className="text-green-800">
            <strong>Resolved:</strong> {conflict.resolutionNotes}
          </p>
        </div>
      ) : (
        onResolve && (
          <button
            onClick={e => {
              e.stopPropagation()
              onResolve()
            }}
            className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Mark as Resolved
          </button>
        )
      )}
    </Card>
  )
}
