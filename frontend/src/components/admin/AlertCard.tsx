import React from 'react'
import type { Alert } from '../../data/adminDashboard'

interface AlertCardProps {
  readonly alert: Alert
  readonly onClick?: () => void
}

const severityConfig = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '⚠️',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚡',
    text: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✓',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
  },
}

export const AlertCard: React.FC<Readonly<AlertCardProps>> = ({ alert, onClick }) => {
  const config = severityConfig[alert.severity]

  return (
    <div
      onClick={onClick}
      className={`${config.bg} border ${config.border} rounded-lg p-4 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-1">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-semibold text-sm ${config.text}`}>{alert.title}</h4>
            <span className={`${config.badge} text-xs font-medium px-2 py-1 rounded whitespace-nowrap`}>
              {alert.severity === 'critical' && 'Khẩn cấp'}
              {alert.severity === 'warning' && 'Cảnh báo'}
              {alert.severity === 'info' && 'Thông tin'}
              {alert.severity === 'success' && 'Thành công'}
            </span>
          </div>
          <p className={`text-xs ${config.text} mt-1 opacity-90`}>{alert.message}</p>
          <p className={`text-xs ${config.text} mt-2 opacity-75`}>{alert.timestamp}</p>
        </div>
      </div>
    </div>
  )
}
