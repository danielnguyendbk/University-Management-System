import React from 'react'

type StatusType = 'pending' | 'processing' | 'approved' | 'rejected' | 'high' | 'medium' | 'low' | 'completed' | 'warning' | 'error'

interface StatusBadgeProps {
  readonly status: StatusType
  readonly label?: string
  readonly size?: 'sm' | 'md'
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
  high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cao' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Trung bình' },
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thấp' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn tất' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cảnh báo' },
  error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Lỗi' },
}

export const StatusBadge: React.FC<Readonly<StatusBadgeProps>> = ({
  status,
  label,
  size = 'md',
}) => {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'

  return (
    <span className={`${config.bg} ${config.text} font-medium rounded ${sizeClass} inline-block`}>
      {label || config.label}
    </span>
  )
}
