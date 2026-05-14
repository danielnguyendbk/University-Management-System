import React from 'react'

interface BadgeProps {
  readonly label: string
  readonly variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning'
  readonly size?: 'sm' | 'md'
}

export const Badge: React.FC<Readonly<BadgeProps>> = ({
  label,
  variant = 'default',
  size = 'sm',
}) => {
  const variantStyles = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full font-medium`}>
      {label}
    </span>
  )
}
