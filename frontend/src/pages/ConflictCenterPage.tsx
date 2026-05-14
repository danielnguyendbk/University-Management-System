import React, { useState } from 'react'
import { DashboardLayout } from '../components/layouts/DashboardLayout'
import { ConflictList } from '../components/conflict/ConflictList'
import { Card } from '../components/common/Card'
import type { UserRole, Conflict } from '../types'
import { mockConflicts } from '../data/mockConflicts'

interface ConflictCenterPageProps {
  readonly userRole: UserRole
  readonly userName?: string
}

export const ConflictCenterPage: React.FC<Readonly<ConflictCenterPageProps>> = ({
  userRole,
  userName = 'User',
}) => {
  const [conflicts, setConflicts] = useState<readonly Conflict[]>(mockConflicts)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)

  const handleResolve = (id: string) => {
    setConflicts(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              resolvedAt: new Date().toISOString(),
              resolutionNotes: 'Auto-resolved by system',
            }
          : c
      )
    )
    setSelectedConflict(null)
  }

  const unresolved = conflicts.filter(c => !c.resolvedAt)
  const resolved = conflicts.filter(c => c.resolvedAt)

  const severityCounts = {
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length,
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conflict Center</h1>
          <p className="text-gray-600 mt-2">
            Detect and resolve scheduling conflicts
          </p>
        </div>

        {/* Severity Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-gray-600 text-sm">High Severity</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{severityCounts.high}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Medium Severity</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{severityCounts.medium}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Low Severity</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{severityCounts.low}</p>
          </Card>
        </div>

        {/* Unresolved Conflicts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unresolved Conflicts ({unresolved.length})
          </h2>
          <ConflictList
            conflicts={unresolved}
            onResolve={handleResolve}
          />
        </div>

        {/* Resolved Conflicts */}
        {resolved.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Resolved Conflicts ({resolved.length})
            </h2>
            <ConflictList conflicts={resolved} />
          </div>
        )}

        {/* Detail Panel */}
        {selectedConflict && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <h3 className="font-bold text-lg mb-4">Conflict Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-bold">
                  {selectedConflict.type.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Description</p>
                <p className="font-bold">{selectedConflict.description}</p>
              </div>
              <div>
                <p className="text-gray-600">Affected Slots</p>
                <div className="mt-1 space-y-1">
                  {selectedConflict.affectedSlots.map(slot => (
                    <p key={slot.id} className="font-mono text-xs bg-white p-2 rounded">
                      {slot.dayOfWeek} {slot.startTime}-{slot.endTime}: {slot.subject.code} (
                      {slot.classroom.name})
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedConflict(null)}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
