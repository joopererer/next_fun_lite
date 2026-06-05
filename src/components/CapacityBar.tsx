interface Props {
  current: number
  max: number | null
}

export function CapacityBar({ current, max }: Props) {
  if (max === null) return null
  const pct = Math.min(100, (current / max) * 100)
  const full = current >= max

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{full ? '已满' : `${current} / ${max} 人`}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${full ? 'bg-gray-400' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
