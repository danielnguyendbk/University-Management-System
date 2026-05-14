import React from 'react'
import { StatusBadge } from './StatusBadge'
import type { Conflict, SuggestedRoom } from '../../data/adminDashboard'

interface ConflictDetailPanelProps {
  readonly conflict: Conflict | null
  readonly suggestedRooms?: readonly SuggestedRoom[]
  readonly onApplySuggestion?: (roomCode: string) => void
  readonly onManualOverride?: (roomCode: string) => void
  readonly isLoading?: boolean
}

export const ConflictDetailPanel: React.FC<Readonly<ConflictDetailPanelProps>> = ({
  conflict,
  suggestedRooms = [],
  onApplySuggestion,
  onManualOverride,
  isLoading,
}) => {
  const [overrideRoom, setOverrideRoom] = React.useState('')

  if (!conflict) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">Chọn một xung đột để xem chi tiết</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{conflict.code}</h3>
          <StatusBadge status={conflict.severity} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Nguyên nhân</p>
            <p className="text-sm text-gray-900 mt-1">{conflict.reason}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Mô tả</p>
            <p className="text-sm text-gray-900 mt-1">{conflict.description}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Ảnh hưởng</p>
            <p className="text-sm text-gray-900 mt-1">{conflict.impact}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Phòng bị ảnh hưởng</p>
            <div className="flex gap-2 mt-2">
              {conflict.affectedRooms.map(room => (
                <span
                  key={room}
                  className="inline-block bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded"
                >
                  {room}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Lớp liên quan</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {conflict.affectedClasses.map(cls => (
                <span
                  key={cls}
                  className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Khung giờ</p>
            <p className="text-sm text-gray-900 mt-1">{conflict.timeSlot}</p>
          </div>

          {suggestedRooms.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Gợi ý thay thế</p>
              <div className="space-y-2">
                {suggestedRooms.map(room => (
                  <div key={room.id} className="bg-blue-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm text-gray-900">{room.roomCode}</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {room.fit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Sức chứa:</span> {room.capacity} chỗ
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Tiện ích:</span> {room.features.join(', ')}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Tỷ lệ sử dụng:</span> {room.utilization}%
                    </p>
                    <button
                      onClick={() => onApplySuggestion?.(room.roomCode)}
                      disabled={isLoading}
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 rounded transition-colors disabled:opacity-50"
                    >
                      Áp dụng {room.roomCode}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Override thủ công</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={overrideRoom}
                onChange={e => setOverrideRoom(e.target.value)}
                placeholder="Nhập mã phòng (VD: A205)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => onManualOverride?.(overrideRoom)}
                disabled={isLoading || !overrideRoom}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                Override
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
