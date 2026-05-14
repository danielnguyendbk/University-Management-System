import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { TimetablePage } from './pages/TimetablePage'
import { ApprovalCenterPage } from './pages/ApprovalCenterPage'
import { ConflictCenterPage } from './pages/ConflictCenterPage'
import type { UserRole } from './types'

// Simple role selector for demo
const RoleSelector: React.FC<{
  onRoleSelect: (role: UserRole, name: string) => void
}> = ({ onRoleSelect }) => {
  const roles: readonly { role: UserRole; name: string }[] = [
    { role: 'admin', name: 'Admin Quản Trị' },
    { role: 'lecturer', name: 'Dr. Nguyễn Văn A' },
    { role: 'student', name: 'Nguyễn Văn B (Sinh viên)' },
    { role: 'staff', name: 'Nhân viên Quản lý' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Quản Lý Lịch</h1>
        <p className="text-gray-600 mb-8">Chọn vai trò của bạn để tiếp tục</p>

        <div className="space-y-3">
          {roles.map(({ role, name }) => (
            <button
              key={role}
              onClick={() => onRoleSelect(role, name)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {name} ({role})
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-8 text-center">
          Giao diện demo. Chọn một vai trò để xem hệ thống với tư cách người dùng đó.
        </p>
      </div>
    </div>
  )
}

// Main app routes
const AppRoutes: React.FC<{ userRole: UserRole; userName: string }> = ({
  userRole,
  userName,
}) => {
  // Admin uses special dashboard
  if (userRole === 'admin') {
    return (
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboardPage userName={userName} />} />
        <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    )
  }

  // Other roles use regular routes
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<DashboardPage userRole={userRole} userName={userName} />}
      />
      <Route
        path="/timetable"
        element={<TimetablePage userRole={userRole} userName={userName} />}
      />
      <Route
        path="/approvals"
        element={<ApprovalCenterPage userRole={userRole} userName={userName} />}
      />
      <Route
        path="/conflicts"
        element={<ConflictCenterPage userRole={userRole} userName={userName} />}
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userName, setUserName] = useState<string>('')

  if (!userRole) {
    return (
      <RoleSelector
        onRoleSelect={(role, name) => {
          setUserRole(role)
          setUserName(name)
        }}
      />
    )
  }

  return (
    <Router>
      <AppRoutes userRole={userRole} userName={userName} />
    </Router>
  )
}
