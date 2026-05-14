import React from 'react'
import type { Notification } from '../../data/adminDashboard'
import { StatusBadge } from './StatusBadge'

interface NotificationListProps {
  readonly notifications: readonly Notification[]
  readonly onNotificationClick?: (id: string) => void
}

export const NotificationList: React.FC<Readonly<NotificationListProps>> = ({
  notifications,
  onNotificationClick,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Chưa có thông báo nào</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map(notif => (
        <div
          key={notif.id}
          onClick={() => onNotificationClick?.(notif.id)}
          className={`p-4 hover:bg-gray-50 transition-colors ${onNotificationClick ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-gray-700 flex-1">{notif.message}</p>
            <StatusBadge status={notif.status} size="sm" />
          </div>
          <p className="text-xs text-gray-500 mt-2">{notif.timestamp}</p>
        </div>
      ))}
    </div>
  )
}
