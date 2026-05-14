import React from 'react'
import { StatusBadge } from './StatusBadge'
import type { Conflict } from '../../data/adminDashboard'

interface ConflictPreviewListProps {
  readonly conflicts: readonly Conflict[]
  readonly onConflictClick?: (conflict: Conflict) => void
  readonly selectedConflictId?: string
}

export const ConflictPreviewList: React.FC<Readonly<ConflictPreviewListProps>> = ({
  conflicts,
  onConflictClick,
  selectedConflictId,
}) => {
  if (conflicts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Chưa có xung đột nào</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conflicts.map(conflict => (
        <div
          key={conflict.id}
          onClick={() => onConflictClick?.(conflict)}
          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
            selectedConflictId === conflict.id ? 'border-red-500 bg-red-50' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{conflict.code}</p>
              <p className="text-xs text-gray-600 mt-1">{conflict.reason}</p>
            </div>
            <StatusBadge status={conflict.severity} size="sm" />
          </div>

          <div className="text-xs text-gray-600 mt-2">
            <p>
              <span className="font-medium">Phòng:</span> {conflict.affectedRooms.join(', ')}
            </p>
            <p className="mt-1">
              <span className="font-medium">Lớp:</span> {conflict.affectedClasses.join(', ')}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">{conflict.timeSlot}</p>
        </div>
      ))}
    </div>
  )
}
