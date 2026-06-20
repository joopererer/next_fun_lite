import { unstable_cache } from 'next/cache'
import { fetchWeatherApi } from 'openmeteo'
import { createStorageAdapter } from '@/server/storage'
import { getEnvConfig } from '@/lib/env'
import { getParisDateKey } from '@/shared/activityPhase'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const WEATHER_DAYS = 7

export interface HourlyWeather {
  time: string       // actual UTC ISO, display with provided timezone
  temp: number
  weathercode: number
  precipProb: number
  windspeed: number
}

export interface DailyWeather {
  date: string       // YYYY-MM-DD in location's timezone
  tempMax: number
  tempMin: number
  weathercode: number
  precipProbMax: number
}

export interface WeatherResult {
  type: 'hourly' | 'daily'
  hourly?: HourlyWeather[]
  daily?: DailyWeather[]
  timezone: string
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(location)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'next-fun-lite/1.0 (weather feature)' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json() as Array<{ lat: string; lon: string }>
    if (!Array.isArray(data) || data.length === 0) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

async function fetchWeatherData(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<WeatherResult | null> {
  try {
    const params = {
      latitude: lat,
      longitude: lon,
      hourly: ['temperature_2m', 'weathercode', 'precipitation_probability', 'windspeed_10m'],
      daily: ['temperature_2m_max', 'temperature_2m_min', 'weathercode', 'precipitation_probability_max'],
      timezone: 'auto',
      start_date: startDate,
      end_date: endDate,
    }
    const responses = await fetchWeatherApi(OPEN_METEO_URL, params)
    const response = responses[0]
    const timezone = response.timezone() ?? 'UTC'
    const utcOffset = response.utcOffsetSeconds()

    const hourly = response.hourly()
    const daily = response.daily()
    if (!hourly || !daily) return null

    // hourly.time() is Unix seconds (UTC). Store as actual UTC ISO.
    const hourlyTimeBase = Number(hourly.time())
    const hourlyLen = Number(hourly.variables(0)!.valuesLength())
    const temp2m = hourly.variables(0)!
    const weathercode = hourly.variables(1)!
    const precipProb = hourly.variables(2)!
    const windspeed = hourly.variables(3)!

    const hourlyData: HourlyWeather[] = []
    for (let i = 0; i < hourlyLen; i++) {
      const utcMs = (hourlyTimeBase + i * 3600) * 1000
      hourlyData.push({
        time: new Date(utcMs).toISOString(),
        temp: Math.round(temp2m.values(i) ?? 0),
        weathercode: Math.round(weathercode.values(i) ?? 0),
        precipProb: Math.round(precipProb.values(i) ?? 0),
        windspeed: Math.round((windspeed.values(i) ?? 0) * 10) / 10,
      })
    }

    const dailyTimeBase = Number(daily.time())
    const dailyLen = Number(daily.variables(0)!.valuesLength())
    const tempMax = daily.variables(0)!
    const tempMin = daily.variables(1)!
    const dailyWeathercode = daily.variables(2)!
    const precipProbMax = daily.variables(3)!

    const dailyData: DailyWeather[] = []
    for (let i = 0; i < dailyLen; i++) {
      // daily.time() is midnight UTC of each day; add utcOffset to get local midnight
      const localMidnightMs = (dailyTimeBase + i * 86400 + utcOffset) * 1000
      dailyData.push({
        date: getParisDateKey(new Date(localMidnightMs)),
        tempMax: Math.round(tempMax.values(i) ?? 0),
        tempMin: Math.round(tempMin.values(i) ?? 0),
        weathercode: Math.round(dailyWeathercode.values(i) ?? 0),
        precipProbMax: Math.round(precipProbMax.values(i) ?? 0),
      })
    }

    return { type: 'hourly', hourly: hourlyData, daily: dailyData, timezone }
  } catch {
    return null
  }
}

function isWithinDays(dateIso: string | null, days: number): boolean {
  if (!dateIso) return false
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return false
  const diffMs = d.getTime() - Date.now()
  return diffMs > -24 * 3600 * 1000 && diffMs < days * 24 * 3600 * 1000
}

// Cache only the weather+geocode fetch; activity lookup is done outside to avoid nested cache calls.
const getCachedWeatherForLocation = unstable_cache(
  async (
    location: string,
    actDate: string,
    actDateEnd: string | null,
  ): Promise<WeatherResult | null> => {
    const geo = await geocode(location)
    if (!geo) return null

    const startDate = getParisDateKey(new Date(actDate))
    const endDate = actDateEnd ? getParisDateKey(new Date(actDateEnd)) : startDate

    const raw = await fetchWeatherData(geo.lat, geo.lon, startDate, endDate)
    if (!raw) return null

    const isMultiDayActivity = startDate !== endDate
    if (isMultiDayActivity) {
      return { type: 'daily', daily: raw.daily, timezone: raw.timezone }
    }

    // Single-day: filter hourly to [actStart-1h, actEnd+1h] using actual UTC times
    const actStart = new Date(actDate).getTime()
    const actEnd = actDateEnd ? new Date(actDateEnd).getTime() : actStart + 86400000
    const windowStart = actStart - 3600 * 1000
    const windowEnd = actEnd + 3600 * 1000
    const filtered = (raw.hourly ?? []).filter((h) => {
      const t = new Date(h.time).getTime()
      return t >= windowStart && t <= windowEnd
    })
    return { type: 'hourly', hourly: filtered, timezone: raw.timezone }
  },
  ['weather-location'],
  { revalidate: 3600, tags: ['weather'] },
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activityId = searchParams.get('activityId')
  if (!activityId) {
    return Response.json({ error: 'Missing activityId' }, { status: 400 })
  }

  // Fetch activity directly (no nested unstable_cache)
  const storage = createStorageAdapter(getEnvConfig())
  const activity = await storage.getActivity(activityId)
  if (!activity?.location || !activity.date) {
    return Response.json(null)
  }
  if (!isWithinDays(activity.date, WEATHER_DAYS)) {
    return Response.json(null)
  }

  const result = await getCachedWeatherForLocation(
    activity.location,
    activity.date,
    activity.dateEnd ?? null,
  )
  return Response.json(result ?? null)
}
