import React from 'react'
import { StatusBadge } from './StatusBadge'
import type { Request } from '../../data/adminDashboard'

interface RequestPreviewListProps {
  readonly requests: readonly Request[]
  readonly onRequestClick?: (request: Request) => void
  readonly selectedRequestId?: string
}

export const RequestPreviewList: React.FC<Readonly<RequestPreviewListProps>> = ({
  requests,
  onRequestClick,
  selectedRequestId,
}) => {
  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Chưa có yêu cầu nào</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {requests.map(request => (
        <div
          key={request.id}
          onClick={() => onRequestClick?.(request)}
          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
            selectedRequestId === request.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{request.code}</p>
              <p className="text-xs text-gray-600 mt-1">{request.type}</p>
            </div>
            <StatusBadge status={request.status} size="sm" />
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="text-xs text-gray-600">
              <p>
                <span className="font-medium">Người gửi:</span> {request.requester}
              </p>
              <p className="mt-1">
                <span className="font-medium">Vai trò:</span> {request.role}
              </p>
            </div>
            <StatusBadge status={request.priority} size="sm" />
          </div>

          <p className="text-xs text-gray-500 mt-2">{request.timestamp}</p>
        </div>
      ))}
    </div>
  )
}
