import React from 'react'

interface SettingsPreviewCardProps {
  readonly semester: string
  readonly timeFrames: string
  readonly notificationsEnabled: boolean
  readonly permissions: string
  readonly onOpenSettings?: () => void
}

export const SettingsPreviewCard: React.FC<Readonly<SettingsPreviewCardProps>> = ({
  semester,
  timeFrames,
  notificationsEnabled,
  permissions,
  onOpenSettings,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cài đặt hệ thống</h3>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Mở cài đặt
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Học kỳ hiện hành</p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{semester}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Khung giờ học</p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{timeFrames}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Thông báo</p>
          <div className="flex items-center mt-1">
            <div
              className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <p className="text-sm text-gray-900 ml-2 font-medium">
              {notificationsEnabled ? 'Bật' : 'Tắt'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">Phân quyền</p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{permissions}</p>
        </div>
      </div>
    </div>
  )
}
