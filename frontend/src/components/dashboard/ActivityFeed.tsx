import React from 'react'
import { Card } from '../common/Card'

interface ActivityItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly timestamp: string
  readonly type: 'approval' | 'conflict' | 'timetable' | 'user'
}

interface ActivityFeedProps {
  readonly items: readonly ActivityItem[]
}

const typeIcons: Record<string, string> = {
  approval: '✓',
  conflict: '⚠',
  timetable: '📅',
  user: '👤',
}

export const ActivityFeed: React.FC<Readonly<ActivityFeedProps>> = ({
  items,
}) => {
  return (
    <Card>
      <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0">
            <div className="text-2xl">{typeIcons[item.type]}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
