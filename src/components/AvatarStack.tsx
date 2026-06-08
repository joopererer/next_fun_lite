'use client'

import { useState } from 'react'
import { getAvatarColor, getInitial } from '@/src/lib/avatarColor'

export interface AvatarPreview {
  name: string
  avatarUrl: string | null
}

interface Props {
  previews: AvatarPreview[]
  total: number
  maxVisible?: number
  size?: 'sm' | 'md'
}

export function AvatarStack({ previews, total, maxVisible = 5, size = 'sm' }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const visible = previews.slice(0, maxVisible)
  const overflow = total - visible.length
  const px = size === 'sm' ? 28 : 32
  const fontSize = size === 'sm' ? 11 : 12

  if (total === 0) return null

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {visible.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            className="relative"
            style={{ marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="rounded-full border-2 border-white object-cover"
                style={{ width: px, height: px }}
              />
            ) : (
              <div
                className="rounded-full border-2 border-white flex items-center justify-center text-white font-medium"
                style={{
                  width: px,
                  height: px,
                  backgroundColor: getAvatarColor(p.name),
                  fontSize,
                }}
              >
                {getInitial(p.name)}
              </div>
            )}
            {hoveredIndex === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                {p.name}
              </div>
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="rounded-full border-2 border-white bg-gray-200 text-gray-600 flex items-center justify-center font-medium"
            style={{ width: px, height: px, marginLeft: -8, fontSize, zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
