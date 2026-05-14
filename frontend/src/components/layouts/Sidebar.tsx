import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { UserRole } from '../../types'
import { getAccessiblePages } from '../../utils/permissions'

interface SidebarProps {
  readonly role: UserRole
  readonly collapsed?: boolean
}

const pageConfig: Record<string, { icon: string; label: string }> = {
  dashboard: { icon: '📊', label: 'Dashboard' },
  timetable: { icon: '📅', label: 'Timetable' },
  approvals: { icon: '✓', label: 'Approvals' },
  conflicts: { icon: '⚠', label: 'Conflicts' },
  admin: { icon: '⚙', label: 'Admin' },
}

export const Sidebar: React.FC<Readonly<SidebarProps>> = ({
  role,
  collapsed = false,
}) => {
  const location = useLocation()
  const pages = getAccessiblePages(role)

  return (
    <aside className={`bg-gray-900 text-white transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-700">
        <h2 className={`font-bold ${collapsed ? 'text-sm' : 'text-lg'}`}>
          {collapsed ? 'TT' : 'Timetable'}
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        {pages.map(page => {
          const config = pageConfig[page]
          const isActive = location.pathname.includes(page)

          return (
            <Link
              key={page}
              to={`/${page}`}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? config?.label : ''}
            >
              <span>{config?.icon}</span>
              {!collapsed && <span>{config?.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
