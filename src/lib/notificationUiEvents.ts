export const NOTIFICATION_DRAWER_OPEN_EVENT = 'nfl_open_notifications'
export const NOTIFICATION_DRAWER_STATE_EVENT = 'nfl_notifications_drawer_state'

export function openNotificationDrawer(): void {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_DRAWER_OPEN_EVENT))
}

export function emitNotificationDrawerState(open: boolean): void {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_DRAWER_STATE_EVENT, { detail: { open } }),
  )
}
