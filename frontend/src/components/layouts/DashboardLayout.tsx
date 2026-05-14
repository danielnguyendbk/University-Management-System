import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import type { UserRole } from '../../types'

interface DashboardLayoutProps {
  readonly children: React.ReactNode
  readonly userRole: UserRole
  readonly userName?: string
  readonly onLogout?: () => void
}

export const DashboardLayout: React.FC<Readonly<DashboardLayoutProps>> = ({
  children,
  userRole,
  userName = 'User',
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar role={userRole} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole={userRole} onLogout={onLogout} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
