import { nanoid } from 'nanoid'

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('nfl_device_id')
  if (!id) {
    id = nanoid(16)
    localStorage.setItem('nfl_device_id', id)
  }
  return id
}
