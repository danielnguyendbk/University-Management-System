import React from 'react'

interface AdminTopbarProps {
  readonly pageTitle?: string
  readonly userName?: string
  readonly userRole?: string
  readonly onSearch?: (query: string) => void
  readonly onLogout?: () => void
}

export const AdminTopbar: React.FC<Readonly<AdminTopbarProps>> = ({
  pageTitle = 'Trung tâm điều hành quản trị',
  userName = 'Admin',
  userRole = 'Quản trị',
  onSearch,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-8 py-4 flex items-center justify-between gap-6">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              placeholder="Tìm kiếm yêu cầu, xung đột, phòng..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Admin Profile Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>

          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Đăng xuất"
          >
            🚪
          </button>

          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            👨
          </div>
        </div>
      </div>
    </div>
  )
}
