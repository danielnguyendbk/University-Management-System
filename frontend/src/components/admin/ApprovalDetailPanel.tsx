import React from 'react'
import type { Request } from '../../data/adminDashboard'
import { StatusBadge } from './StatusBadge'

interface ApprovalDetailPanelProps {
  readonly request: Request | null
  readonly onApprove?: () => void
  readonly onReject?: () => void
  readonly onRequestMore?: () => void
  readonly onTransfer?: () => void
  readonly isLoading?: boolean
}

export const ApprovalDetailPanel: React.FC<Readonly<ApprovalDetailPanelProps>> = ({
  request,
  onApprove,
  onReject,
  onRequestMore,
  onTransfer,
  isLoading,
}) => {
  if (!request) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Chọn một yêu cầu để xem chi tiết
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{request.code}</h3>
          <StatusBadge status={request.status} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Loại yêu cầu</p>
            <p className="text-sm text-gray-900 mt-1">{request.type}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Người gửi</p>
            <p className="text-sm text-gray-900 mt-1">{request.requester}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Vai trò</p>
            <p className="text-sm text-gray-900 mt-1">{request.role}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Mô tả</p>
            <p className="text-sm text-gray-900 mt-1">{request.description || 'Không có mô tả'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Minh chứng</p>
            <p className="text-sm text-gray-900 mt-1 font-mono text-xs bg-gray-50 p-2 rounded">
              {request.evidence || 'Không có'}
            </p>
          </div>

          {request.suggestedRooms && request.suggestedRooms.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Gợi ý phòng thay thế</p>
              <div className="flex gap-2 mt-2">
                {request.suggestedRooms.map(room => (
                  <span
                    key={room}
                    className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded"
                  >
                    {room}
                  </span>
                ))}
              </div>
            </div>
          )}

          {request.timeline && request.timeline.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Lịch sử xử lý</p>
              <div className="space-y-2">
                {request.timeline.map(event => (
                  <div key={event.id} className="text-xs bg-gray-50 p-3 rounded">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-gray-600">{event.action}</p>
                    <p className="text-gray-500 mt-1">{event.actor} - {event.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 pt-4 mt-auto space-y-2">
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Duyệt
        </button>
        <button
          onClick={onReject}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Từ chối
        </button>
        <button
          onClick={onRequestMore}
          disabled={isLoading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Yêu cầu bổ sung
        </button>
        <button
          onClick={onTransfer}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Chuyển giáo vụ
        </button>
      </div>
    </div>
  )
}
