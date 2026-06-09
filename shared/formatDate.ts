export function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  if (hours === '00' && minutes === '00') {
    return `${month}月${day}日`
  }
  return `${month}月${day}日 ${hours}:${minutes}`
}
