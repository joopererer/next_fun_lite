export const ACTIVITIES_CHANGED_EVENT = 'nfl:activities-changed'

export function notifyActivitiesChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(ACTIVITIES_CHANGED_EVENT))
}
