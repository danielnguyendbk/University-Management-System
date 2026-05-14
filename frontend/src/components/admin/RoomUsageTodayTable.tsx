import React from 'react'
import type { RoomUsageToday } from '../../data/adminDashboard'

interface RoomUsageTodayTableProps {
  readonly data: readonly RoomUsageToday[]
}

export const RoomUsageTodayTable: React.FC<Readonly<RoomUsageTodayTableProps>> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Không có lớp học nào hôm nay</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    if (status.includes('Đã đổi')) return 'bg-blue-50 text-blue-700'
    if (status.includes('Tạm khóa')) return 'bg-red-50 text-red-700'
    if (status.includes('Theo dõi')) return 'bg-yellow-50 text-yellow-700'
    if (status.includes('Đang dạy')) return 'bg-green-50 text-green-700'
    if (status.includes('Chờ')) return 'bg-gray-50 text-gray-700'
    return 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Phòng</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Khung giờ</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Lớp</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {data.map(usage => (
            <tr key={usage.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{usage.room}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{usage.timeSlot}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{usage.className}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block text-xs font-medium px-3 py-1 rounded ${getStatusColor(usage.status)}`}
                >
                  {usage.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{usage.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
