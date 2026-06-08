export function getAvatarColor(name: string): string {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#34d399',
    '#38bdf8', '#818cf8', '#e879f9', '#f472b6',
  ]
  let hash = 0
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const first = trimmed[0]
  if (/[\u4e00-\u9fff]/.test(first)) return first
  return first.toUpperCase()
}
