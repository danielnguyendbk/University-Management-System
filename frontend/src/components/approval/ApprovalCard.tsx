import React from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { getApprovalStatusColor } from '../../utils/timeSlots'
import type { ApprovalRequest } from '../../types'

interface ApprovalCardProps {
  readonly approval: ApprovalRequest
  readonly onApprove?: () => void
  readonly onReject?: () => void
}

export const ApprovalCard: React.FC<Readonly<ApprovalCardProps>> = ({
  approval,
  onApprove,
  onReject,
}) => {
  void getApprovalStatusColor(approval.status)

  return (
    <Card className="border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg capitalize">
            {approval.type.replace(/_/g, ' ')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            By: <strong>{approval.requester.name}</strong>
          </p>
        </div>
        <Badge
          label={approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          variant={
            approval.status === 'approved'
              ? 'success'
              : approval.status === 'rejected'
                ? 'danger'
                : 'warning'
          }
        />
      </div>

      <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
        <pre className="text-xs overflow-auto max-h-40 text-gray-700">
          {JSON.stringify(approval.content, null, 2)}
        </pre>
      </div>

      {approval.comments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Comments:</p>
          <div className="space-y-1">
            {approval.comments.map((comment, idx) => (
              <p key={idx} className="text-sm text-gray-600 italic">
                "{comment}"
              </p>
            ))}
          </div>
        </div>
      )}

      {approval.status === 'pending' && (onApprove || onReject) && (
        <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-200">
          {onReject && (
            <Button label="Reject" variant="danger" onClick={onReject} size="sm" />
          )}
          {onApprove && (
            <Button label="Approve" variant="success" onClick={onApprove} size="sm" />
          )}
        </div>
      )}
    </Card>
  )
}
