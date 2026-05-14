import React from 'react'

interface SectionCardProps {
  readonly title: string
  readonly children: React.ReactNode
  readonly action?: {
    readonly label: string
    readonly onClick: () => void
  }
}

export const SectionCard: React.FC<Readonly<SectionCardProps>> = ({ title, children, action }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 p-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
