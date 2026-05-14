import React from 'react'
import type { AutoAllocationStatus } from '../../data/adminDashboard'

interface AutoAllocationCardProps {
  readonly status: AutoAllocationStatus
  readonly onRunAllocation?: () => void
  readonly onViewRules?: () => void
  readonly isLoading?: boolean
}

export const AutoAllocationCard: React.FC<Readonly<AutoAllocationCardProps>> = ({
  status,
  onRunAllocation,
  onViewRules,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân phòng tự động</h3>

      <div className="space-y-3 mb-5">
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Bộ quy tắc hiện hành</p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{status.currentRules}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Lần chạy gần nhất</p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{status.lastRun}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Lớp đã gán phòng</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{status.classroomsAllocated}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Chờ phê duyệt thủ công</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {status.classroomsNeedManualApproval}
            </p>
          </div>
        </div>

        {status.errors && status.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700 font-medium mb-2">Lỗi:</p>
            <ul className="space-y-1">
              {status.errors.map((error, idx) => (
                <li key={`${idx}-${error}`} className="text-xs text-red-600">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRunAllocation}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Đang chạy...' : 'Chạy phân phòng'}
        </button>
        <button
          onClick={onViewRules}
          disabled={isLoading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          Xem quy tắc
        </button>
      </div>
    </div>
  )
}
