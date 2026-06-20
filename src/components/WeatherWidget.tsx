'use client'

import { useEffect, useState } from 'react'
import type { WeatherResult, HourlyWeather, DailyWeather } from '../app/api/weather/route'
import { getWeatherDesc } from '../lib/weatherCode'

interface Props {
  activityId: string
}

function HourlyRow({ h }: { h: HourlyWeather }) {
  const { emoji, label } = getWeatherDesc(h.weathercode)
  const time = new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return (
    <div className="flex items-center gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 w-12 shrink-0">{time}</span>
      <span className="text-base">{emoji}</span>
      <span className="text-gray-700 flex-1">{label}</span>
      <span className="font-medium text-gray-800">{h.temp}°C</span>
      {h.precipProb > 0 && (
        <span className="text-blue-500 text-xs">💧{h.precipProb}%</span>
      )}
    </div>
  )
}

function DailyRow({ d }: { d: DailyWeather }) {
  const { emoji, label } = getWeatherDesc(d.weathercode)
  const [, month, day] = d.date.split('-')
  return (
    <div className="flex items-center gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 w-12 shrink-0">{Number(month)}月{Number(day)}日</span>
      <span className="text-base">{emoji}</span>
      <span className="text-gray-700 flex-1">{label}</span>
      <span className="font-medium text-gray-800">{d.tempMax}° / {d.tempMin}°</span>
      {d.precipProbMax > 0 && (
        <span className="text-blue-500 text-xs">💧{d.precipProbMax}%</span>
      )}
    </div>
  )
}

export function WeatherWidget({ activityId }: Props) {
  const [weather, setWeather] = useState<WeatherResult | null | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/weather?activityId=${activityId}`)
      .then((r) => r.json())
      .then((data: unknown) => setWeather(data as WeatherResult | null))
      .catch(() => setWeather(null))
  }, [activityId])

  if (weather === undefined) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    )
  }

  if (!weather) return null

  const rows =
    weather.type === 'hourly'
      ? weather.hourly ?? []
      : weather.daily ?? []

  if (rows.length === 0) return null

  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-sm">
      <p className="text-xs text-sky-600 font-medium mb-2">🌤 活动天气预报</p>
      {weather.type === 'hourly'
        ? (weather.hourly ?? []).map((h) => <HourlyRow key={h.time} h={h} />)
        : (weather.daily ?? []).map((d) => <DailyRow key={d.date} d={d} />)
      }
      <p className="text-xs text-gray-400 mt-2">数据来源：Open-Meteo · 仅供参考</p>
    </div>
  )
}
