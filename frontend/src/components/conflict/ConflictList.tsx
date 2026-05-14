import React from 'react'
import { ConflictCard } from './ConflictCard'
import type { Conflict } from '../../types'

interface ConflictListProps {
  readonly conflicts: readonly Conflict[]
  readonly onResolve?: (id: string) => void
}

export const ConflictList: React.FC<Readonly<ConflictListProps>> = ({
  conflicts,
  onResolve,
}) => {
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No conflicts detected</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {conflicts.map(conflict => (
        <ConflictCard
          key={conflict.id}
          conflict={conflict}
          onResolve={() => onResolve?.(conflict.id)}
        />
      ))}
    </div>
  )
}
