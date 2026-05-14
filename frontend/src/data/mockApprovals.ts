import type { ApprovalRequest } from '../types'
import { mockUsers } from './mockBasic'

// Mock Approvals
export const mockApprovals: readonly ApprovalRequest[] = [
  {
    id: 'approval_1',
    type: 'timetable_change',
    requester: mockUsers[1],
    content: { reason: 'Need to reschedule Monday class due to conference' },
    status: 'pending',
    assignedTo: mockUsers[0],
    comments: [],
    createdAt: '2026-04-16T10:00:00Z',
  },
  {
    id: 'approval_2',
    type: 'classroom_booking',
    requester: mockUsers[2],
    content: { classroomId: 'classroom_3', reason: 'Lab equipment needed' },
    status: 'pending',
    assignedTo: mockUsers[4],
    comments: ['Need confirmation on available dates'],
    createdAt: '2026-04-15T14:00:00Z',
  },
  {
    id: 'approval_3',
    type: 'subject_addition',
    requester: mockUsers[1],
    content: { subjectCode: 'CS401', subjectName: 'Advanced Algorithms' },
    status: 'approved',
    assignedTo: mockUsers[0],
    comments: ['Approved - budget confirmed'],
    createdAt: '2026-04-10T09:00:00Z',
    resolvedAt: '2026-04-11T10:00:00Z',
  },
  {
    id: 'approval_4',
    type: 'timetable_change',
    requester: mockUsers[2],
    content: { reason: 'Student feedback - time conflict' },
    status: 'rejected',
    assignedTo: mockUsers[0],
    comments: ['No available alternative slots'],
    createdAt: '2026-04-12T11:00:00Z',
    resolvedAt: '2026-04-12T15:00:00Z',
  },
]
