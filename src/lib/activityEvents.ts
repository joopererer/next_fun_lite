export const ACTIVITIES_CHANGED_EVENT = 'nfl:activities-changed'
const ACTIVITIES_DIRTY_KEY = 'nfl:activities-dirty'

export function notifyActivitiesChanged(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ACTIVITIES_DIRTY_KEY, '1')
  window.dispatchEvent(new Event(ACTIVITIES_CHANGED_EVENT))
}

export function consumeActivitiesDirtyFlag(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(ACTIVITIES_DIRTY_KEY) !== '1') return false
  sessionStorage.removeItem(ACTIVITIES_DIRTY_KEY)
  return true
}
