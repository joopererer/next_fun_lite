export function getItineraryItems(itinerary: string | undefined | null): string[] {
  if (!itinerary?.trim()) return []
  return itinerary
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}
