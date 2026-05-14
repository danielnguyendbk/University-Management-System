import React from 'react'
import { Button } from '../common/Button'

interface HeaderProps {
  readonly userName?: string
  readonly userRole?: string
  readonly onLogout?: () => void
}

export const Header: React.FC<Readonly<HeaderProps>> = ({
  userName = 'User',
  userRole = 'admin',
  onLogout,
}) => {
  return (
    <header className="bg-white shadow border-b border-gray-200 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">University Timetable Portal</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, <strong>{userName}</strong> ({userRole})
          </p>
        </div>
        {onLogout && (
          <Button label="Logout" variant="secondary" onClick={onLogout} />
        )}
      </div>
    </header>
  )
}
