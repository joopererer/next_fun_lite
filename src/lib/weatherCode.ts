/** WMO Weather interpretation codes → emoji + short label */
export interface WeatherDesc {
  emoji: string
  label: string
}

const WMO_MAP: Record<number, WeatherDesc> = {
  0: { emoji: '☀️', label: '晴' },
  1: { emoji: '🌤', label: '晴转多云' },
  2: { emoji: '⛅', label: '多云' },
  3: { emoji: '☁️', label: '阴' },
  45: { emoji: '🌫', label: '雾' },
  48: { emoji: '🌫', label: '雾凇' },
  51: { emoji: '🌦', label: '小毛毛雨' },
  53: { emoji: '🌦', label: '毛毛雨' },
  55: { emoji: '🌧', label: '大毛毛雨' },
  61: { emoji: '🌧', label: '小雨' },
  63: { emoji: '🌧', label: '中雨' },
  65: { emoji: '🌧', label: '大雨' },
  71: { emoji: '🌨', label: '小雪' },
  73: { emoji: '🌨', label: '中雪' },
  75: { emoji: '🌨', label: '大雪' },
  77: { emoji: '🌨', label: '雪粒' },
  80: { emoji: '🌦', label: '小阵雨' },
  81: { emoji: '🌧', label: '阵雨' },
  82: { emoji: '⛈', label: '强阵雨' },
  85: { emoji: '🌨', label: '阵雪' },
  86: { emoji: '🌨', label: '强阵雪' },
  95: { emoji: '⛈', label: '雷暴' },
  96: { emoji: '⛈', label: '雷暴+冰雹' },
  99: { emoji: '⛈', label: '强雷暴+冰雹' },
}

export function getWeatherDesc(code: number): WeatherDesc {
  return WMO_MAP[code] ?? { emoji: '🌡', label: `代码${code}` }
}
