'use client'

import { useEffect, useState } from 'react'
import type { WeatherCompact } from '../app/api/weather/route'

interface Props {
  activityId: string
  activityDate: string | null
}

function isWithin7Days(dateIso: string | null): boolean {
  if (!dateIso) return false
  const diff = new Date(dateIso).getTime() - Date.now()
  return diff > -24 * 3600 * 1000 && diff < 7 * 24 * 3600 * 1000
}

export function WeatherBadge({ activityId, activityDate }: Props) {
  const [weather, setWeather] = useState<WeatherCompact | null | undefined>(undefined)

  useEffect(() => {
    if (!isWithin7Days(activityDate)) {
      setWeather(null)
      return
    }
    fetch(`/api/weather?activityId=${activityId}&compact=1`)
      .then((r) => r.json())
      .then((data: unknown) => setWeather(data as WeatherCompact | null))
      .catch(() => setWeather(null))
  }, [activityId, activityDate])

  if (!weather) return null

  return (
    <span className="ml-auto text-xs text-gray-500 flex items-center gap-0.5 shrink-0">
      <span>{weather.emoji}</span>
      <span className="font-medium">{weather.temp}°</span>
      {weather.precipProb >= 20 && (
        <span className="text-blue-400">💧{weather.precipProb}%</span>
      )}
    </span>
  )
}
