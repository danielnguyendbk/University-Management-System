import React, { useState } from 'react'
import { DashboardLayout } from '../components/layouts/DashboardLayout'
import { ApprovalList } from '../components/approval/ApprovalList'
import { Card } from '../components/common/Card'
import type { UserRole, ApprovalRequest } from '../types'
import { mockApprovals } from '../data/mockApprovals'

interface ApprovalCenterPageProps {
  readonly userRole: UserRole
  readonly userName?: string
}

export const ApprovalCenterPage: React.FC<Readonly<ApprovalCenterPageProps>> = ({
  userRole,
  userName = 'User',
}) => {
  const [approvals, setApprovals] = useState<readonly ApprovalRequest[]>(mockApprovals)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const filtered = approvals.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const handleApprove = (id: string) => {
    setApprovals(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: 'approved' as const, resolvedAt: new Date().toISOString() }
          : a
      )
    )
  }

  const handleReject = (id: string) => {
    setApprovals(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: 'rejected' as const, resolvedAt: new Date().toISOString() }
          : a
      )
    )
  }

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Center</h1>
          <p className="text-gray-600 mt-2">
            Review and manage approval requests
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white p-4 rounded-lg shadow">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Approval List */}
        <ApprovalList
          approvals={filtered}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  )
}
