import React from 'react'
import { ApprovalCard } from './ApprovalCard'
import type { ApprovalRequest } from '../../types'

interface ApprovalListProps {
  readonly approvals: readonly ApprovalRequest[]
  readonly onApprove?: (id: string) => void
  readonly onReject?: (id: string) => void
}

export const ApprovalList: React.FC<Readonly<ApprovalListProps>> = ({
  approvals,
  onApprove,
  onReject,
}) => {
  if (approvals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No approvals to display</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {approvals.map(approval => (
        <ApprovalCard
          key={approval.id}
          approval={approval}
          onApprove={() => onApprove?.(approval.id)}
          onReject={() => onReject?.(approval.id)}
        />
      ))}
    </div>
  )
}
