import React from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'

interface StatCardProps {
  readonly label: string
  readonly value: number | string
  readonly trend?: 'up' | 'down'
}

export const StatCard: React.FC<Readonly<StatCardProps>> = ({
  label,
  value,
  trend,
}) => {
  return (
    <Card>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <Badge
            label={trend === 'up' ? '↑ Up' : '↓ Down'}
            variant={trend === 'up' ? 'success' : 'danger'}
            size="sm"
          />
        )}
      </div>
    </Card>
  )
}
