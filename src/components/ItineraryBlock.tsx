import { getItineraryItems } from '../lib/itinerary'

interface Props {
  itinerary: string
  className?: string
}

export function ItineraryBlock({ itinerary, className = '' }: Props) {
  const items = getItineraryItems(itinerary)
  if (items.length === 0) return null

  return (
    <div className={className}>
      <p className="font-medium text-gray-800 mb-2">🗓 活动行程</p>
      <ol className="text-sm text-gray-700 space-y-1.5 list-decimal list-inside">
        {items.map((item) => (
          <li key={item} className="whitespace-pre-wrap">{item}</li>
        ))}
      </ol>
    </div>
  )
}
