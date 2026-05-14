import React from 'react'
import type { ReportSummary } from '../../data/adminDashboard'

interface ReportsPreviewCardProps {
  readonly reports: ReportSummary
  readonly onOpenReports?: () => void
}

export const ReportsPreviewCard: React.FC<Readonly<ReportsPreviewCardProps>> = ({
  reports,
  onOpenReports,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Thống kê báo cáo</h3>
        {onOpenReports && (
          <button
            onClick={onOpenReports}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Mở báo cáo chi tiết
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Tỷ lệ sử dụng phòng</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{reports.roomUtilization}%</p>
          <p className="text-xs text-gray-500 mt-1">Trung bình hôm nay</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Tỷ lệ duyệt yêu cầu</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{reports.approvalRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Tuần này</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Xung đột/tuần</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{reports.conflictPerWeek}</p>
          <p className="text-xs text-gray-500 mt-1">Trung bình tuần</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Phòng bảo trì kéo dài</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{reports.prolongedMaintenance}</p>
          <p className="text-xs text-gray-500 mt-1">Đang chờ xử lý</p>
        </div>
      </div>
    </div>
  )
}
