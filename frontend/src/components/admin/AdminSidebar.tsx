import React from 'react'
import type { OperationalProgress } from '../../data/adminDashboard'

interface AdminSidebarProps {
  readonly userName?: string
  readonly userRole?: string
  readonly avatar?: string
  readonly semesterInfo?: string
  readonly totalStats?: {
    readonly classes: number
    readonly students: number
    readonly lecturers: number
  }
  readonly operationalProgress?: readonly OperationalProgress[]
  readonly onNavigate?: (page: string) => void
  readonly activePage?: string
}

const navigationItems = [
  { id: 'overview', label: 'Tổng quan', icon: '📊' },
  { id: 'classrooms', label: 'Quản lý phòng học', icon: '🏫' },
  { id: 'subjects', label: 'Quản lý môn học', icon: '📚' },
  { id: 'lecturers', label: 'Quản lý giảng viên', icon: '👨‍🏫' },
  { id: 'users', label: 'Quản lý người dùng', icon: '👥' },
  { id: 'timetable', label: 'Quản lý thời khóa biểu', icon: '⏱️' },
  { id: 'allocation', label: 'Phân phòng tự động', icon: '🤖' },
  { id: 'approvals', label: 'Trung tâm phê duyệt', icon: '✅' },
  { id: 'reports', label: 'Báo cáo', icon: '📈' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
]

export const AdminSidebar: React.FC<Readonly<AdminSidebarProps>> = ({
  userName = 'Admin',
  userRole = 'Quản trị viên',
  avatar,
  semesterInfo = 'Kỳ I 2025-2026',
  totalStats,
  operationalProgress,
  onNavigate,
  activePage = 'overview',
}) => {
  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-1">Quản Trị</h1>
        <p className="text-gray-400 text-sm">Trung tâm điều hành</p>
      </div>

      {/* Admin Profile */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {avatar ? <img src={avatar} alt={userName} className="rounded-full" /> : '👨'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-gray-400">{userRole}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 text-xs">
          <p className="text-gray-400 mb-1">Học kỳ</p>
          <p className="font-semibold text-white">{semesterInfo}</p>

          {totalStats && (
            <div className="mt-3 space-y-1 text-xs">
              <p>
                <span className="text-gray-400">Lớp học:</span>{' '}
                <span className="text-white font-semibold">{totalStats.classes}</span>
              </p>
              <p>
                <span className="text-gray-400">Sinh viên:</span>{' '}
                <span className="text-white font-semibold">{totalStats.students}</span>
              </p>
              <p>
                <span className="text-gray-400">Giảng viên:</span>{' '}
                <span className="text-white font-semibold">{totalStats.lecturers}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigationItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate?.(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Operational Progress */}
      {operationalProgress && operationalProgress.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Tiến độ vận hành</p>
          <div className="space-y-3">
            {operationalProgress.map(progress => (
              <div key={progress.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-300">{progress.label}</p>
                  <p className="text-xs font-semibold text-gray-300">{progress.percentage}%</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-600 h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.current}/{progress.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
