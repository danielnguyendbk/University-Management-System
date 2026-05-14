import React from 'react'
import { DashboardLayout } from '../components/layouts/DashboardLayout'
import { StatCard } from '../components/dashboard/StatCard'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import type { UserRole } from '../types'
import { mockApprovals } from '../data/mockApprovals'
import { mockConflicts } from '../data/mockConflicts'
import { mockTimetables } from '../data/mockTimetables'

interface DashboardPageProps {
  readonly userRole: UserRole
  readonly userName?: string
}

export const DashboardPage: React.FC<Readonly<DashboardPageProps>> = ({
  userRole,
  userName = 'User',
}) => {
  const pendingApprovals = mockApprovals.filter(a => a.status === 'pending').length
  const activeConflicts = mockConflicts.filter(c => !c.resolvedAt).length
  const totalSlots = mockTimetables[0]?.slots.length ?? 0

  const activityItems = [
    {
      id: '1',
      title: 'Timetable Published',
      description: 'Weekly timetable for week 1 is now published',
      timestamp: '2 hours ago',
      type: 'timetable' as const,
    },
    {
      id: '2',
      title: 'New Approval Request',
      description: 'Classroom booking request from Dr. John Smith',
      timestamp: '1 hour ago',
      type: 'approval' as const,
    },
    {
      id: '3',
      title: 'Conflict Detected',
      description: 'Room 101 has overlapping bookings',
      timestamp: '30 minutes ago',
      type: 'conflict' as const,
    },
  ]

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your system overview.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Classes" value={totalSlots} trend="up" />
          <StatCard label="Pending Approvals" value={pendingApprovals} />
          <StatCard label="Active Conflicts" value={activeConflicts} trend="down" />
          <StatCard label="Active Timetables" value={mockTimetables.length} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed items={activityItems} />
      </div>
    </DashboardLayout>
  )
}
