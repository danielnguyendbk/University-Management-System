import React from 'react'

interface ConfirmModalProps {
  readonly isOpen: boolean
  readonly title: string
  readonly message: string
  readonly confirmText?: string
  readonly cancelText?: string
  readonly variant?: 'danger' | 'warning' | 'info'
  readonly onConfirm: () => void
  readonly onCancel: () => void
  readonly isLoading?: boolean
}

export const ConfirmModal: React.FC<Readonly<ConfirmModalProps>> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'warning',
  onConfirm,
  onCancel,
  isLoading,
}) => {
  if (!isOpen) return null

  const variantConfig = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '⚠️',
      button: 'bg-red-600 hover:bg-red-700',
      text: 'text-red-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '⚡',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      text: 'text-yellow-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ℹ️',
      button: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-900',
    },
  }

  const config = variantConfig[variant]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl flex-shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className={`text-sm mt-2 ${config.text} leading-relaxed`}>{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${config.button} text-white font-medium rounded-lg transition-colors disabled:opacity-50`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
