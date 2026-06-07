import type { Activity } from './types'

export type SimilarMatchStatus = 'same_url' | 'similar' | 'same_title'

export interface SimilarProposalMatch {
  id: string
  title: string
  location?: string
  status: SimilarMatchStatus
}

const TRACKING_PARAMS = [
  'aff', 'affiliate', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
]

export function normalizeActivitySourceUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim())
    for (const key of TRACKING_PARAMS) {
      url.searchParams.delete(key)
    }
    url.hash = ''
    return url.toString()
  } catch {
    return rawUrl.trim()
  }
}

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function proposalFingerprint(title: string, location: string): string {
  return `${norm(title)}|${norm(location)}`
}

export function findSimilarProposals(
  proposals: Activity[],
  input: { title: string; location?: string; sourceUrl?: string },
): SimilarProposalMatch[] {
  const title = input.title.trim()
  if (!title) return []

  const normalizedUrl = input.sourceUrl?.trim()
    ? normalizeActivitySourceUrl(input.sourceUrl)
    : ''
  const location = input.location?.trim() ?? ''
  const inputFingerprint = location ? proposalFingerprint(title, location) : null
  const normalizedTitle = norm(title)

  const matches: SimilarProposalMatch[] = []
  const seen = new Set<string>()

  for (const p of proposals) {
    if (p.status !== 'proposed') continue

    if (normalizedUrl && p.sourceUrl) {
      const existingUrl = normalizeActivitySourceUrl(p.sourceUrl)
      if (existingUrl === normalizedUrl) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          matches.push({
            id: p.id,
            title: p.title,
            location: p.location || undefined,
            status: 'same_url',
          })
        }
        continue
      }
    }

    if (inputFingerprint && p.location?.trim()) {
      if (proposalFingerprint(p.title, p.location) === inputFingerprint) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          matches.push({
            id: p.id,
            title: p.title,
            location: p.location || undefined,
            status: 'similar',
          })
        }
        continue
      }
    }

    if (norm(p.title) === normalizedTitle) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        matches.push({
          id: p.id,
          title: p.title,
          location: p.location || undefined,
          status: 'same_title',
        })
      }
    }
  }

  return matches.slice(0, 5)
}

export function similarMatchLabel(status: SimilarMatchStatus): string {
  switch (status) {
    case 'same_url':
      return '相同参考链接'
    case 'similar':
      return '标题与地点相近'
    case 'same_title':
      return '标题相同'
  }
}
