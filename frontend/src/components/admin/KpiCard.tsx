import React from 'react'

interface KpiCardProps {
  readonly label: string
  readonly value: string | number
  readonly subtext?: string
  readonly icon?: React.ReactNode
  readonly trend?: 'up' | 'down' | 'stable'
  readonly trendValue?: string
  readonly onClick?: () => void
}

export const KpiCard: React.FC<Readonly<KpiCardProps>> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  trendValue,
  onClick,
}) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  }[trend ?? 'stable']

  const trendIcon = {
    up: '↑',
    down: '↓',
    stable: '→',
  }[trend ?? 'stable']

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-2">{subtext}</p>}
        </div>
        {icon && <div className="text-gray-400 text-2xl">{icon}</div>}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center mt-3 ${trendColor}`}>
          <span className="text-lg font-bold">{trendIcon}</span>
          <span className="text-sm font-medium ml-1">{trendValue}</span>
        </div>
      )}
    </div>
  )
}
