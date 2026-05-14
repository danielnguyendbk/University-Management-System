import type { User } from './user'

// Approval domain types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalRequest {
  readonly id: string
  readonly type: 'timetable_change' | 'classroom_booking' | 'subject_addition'
  readonly requester: User
  readonly content: Record<string, unknown>
  readonly status: ApprovalStatus
  readonly assignedTo: User | null
  readonly comments: readonly string[]
  readonly createdAt: string
  readonly resolvedAt?: string
}
