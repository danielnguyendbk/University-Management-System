import type { UserRole } from '../types'

// Permission definitions for each role
const rolePermissions: Record<UserRole, readonly string[]> = {
  admin: [
    'manage_users',
    'manage_classrooms',
    'manage_subjects',
    'view_all_timetables',
    'approve_conflicts',
    'system_settings',
    'view_approvals',
    'resolve_conflicts',
  ],
  lecturer: [
    'schedule_lessons',
    'request_classrooms',
    'view_assigned_timetable',
    'view_student_list',
    'view_approvals',
  ],
  student: [
    'view_personal_timetable',
    'enroll_subjects',
    'view_lecturer_info',
  ],
  staff: [
    'support_users',
    'approve_requests',
    'resolve_conflicts',
    'view_approvals',
    'bulk_operations',
  ],
}

// Check if role has permission for feature
export const canAccessFeature = (role: UserRole, feature: string): boolean => {
  return rolePermissions[role]?.includes(feature) ?? false
}

// Get accessible pages for role
export const getAccessiblePages = (role: UserRole): readonly string[] => {
  const pages: Record<UserRole, readonly string[]> = {
    admin: ['dashboard', 'timetable', 'approvals', 'conflicts', 'admin'],
    lecturer: ['dashboard', 'timetable', 'approvals'],
    student: ['dashboard', 'timetable'],
    staff: ['dashboard', 'approvals', 'conflicts'],
  }
  return pages[role] ?? []
}
