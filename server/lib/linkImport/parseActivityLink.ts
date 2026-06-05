import type { ApiParseResponse, ParseResult } from '../../../shared/types'
import type { ScrapedActivity } from './types'
import {
  formatScrapedDateRange,
  formatScrapedFee,
  inferFeeLevel,
  mapScrapedCategory,
} from './mapScraped'
import {
  activityLinkImportUserAgent,
  enrichSortirActivityAddress,
  extractSortirFrenchStreetAddress,
  findSortirFrenchArticleUrls,
  fetchEventbriteStructuredContent,
  extractEventbriteEventId,
  linkImportDefaultCapacity,
  parseEventbriteEventHtml,
  parseFeverupEventHtml,
  parseMeetupEventHtml,
  parseParisFrEventHtml,
  parsePlayInParisEventHtml,
  parseSortirAParisArticleHtml,
  parseStructuredEventHtml,
} from './scraper'

const requestTimeoutMs = 12_000
const maxHtmlLength = 2_000_000

const supportedHosts: [string, string][] = [
  ['quefaire.paris.fr', 'Que Faire à Paris'],
  ['opendata.paris.fr', 'Paris OpenData'],
  ['sortiraparis.com', 'Sortir à Paris'],
  ['playinparis.com', 'Play in Paris'],
  ['eventbrite.fr', 'Eventbrite'],
  ['billetweb.fr', 'Billetweb'],
  ['meetup.com', 'Meetup'],
  ['feverup.com', 'Fever'],
  ['paris.fr', 'Paris.fr'],
]

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function isEventbriteHost(hostname: string) {
  return /^eventbrite\.[a-z.]+$/i.test(normalizeHost(hostname))
}

function getSupportedSiteName(url: URL): string | null {
  const normalizedHost = normalizeHost(url.hostname)
  if (isEventbriteHost(normalizedHost)) return 'Eventbrite'
  for (const [host, siteName] of supportedHosts) {
    if (normalizedHost === host || normalizedHost.endsWith(`.${host}`)) return siteName
  }
  return null
}

function getLinkImportHostKey(url: URL): string | null {
  const normalizedHost = normalizeHost(url.hostname)
  if (isEventbriteHost(normalizedHost)) return 'eventbrite.fr'
  for (const [host] of supportedHosts) {
    if (normalizedHost === host || normalizedHost.endsWith(`.${host}`)) return host
  }
  return null
}

function scrapedToParseResult(activity: ScrapedActivity, sourceUrl: string): Partial<ParseResult> {
  const fee = formatScrapedFee(activity)
  const dateRangeLabel = formatScrapedDateRange(activity.startAt, activity.endAt)
  const noteParts = [activity.itinerary, dateRangeLabel ? `活动时间：${dateRangeLabel}` : '']
    .filter(Boolean)
  return {
    title: activity.title || null,
    description: activity.description
      ? `${activity.description}\n\n来源：${sourceUrl}`
      : null,
    date: activity.startAt || null,
    dateEnd: activity.endAt || null,
    location: [activity.address, activity.city].filter(Boolean).join(', ') || null,
    maxParticipants: activity.capacity ?? linkImportDefaultCapacity,
    fee: fee || null,
    notes: noteParts.length > 0 ? noteParts.join('\n') : null,
    category: mapScrapedCategory(activity.category),
    feeLevel: inferFeeLevel(activity, fee),
  }
}

function parseSiteSpecific(sourceUrl: URL, html: string): ScrapedActivity | null {
  const hostKey = getLinkImportHostKey(sourceUrl)
  const url = sourceUrl.toString()

  if (hostKey === 'sortiraparis.com') return parseSortirAParisArticleHtml(html, url)
  if (hostKey === 'playinparis.com' && /\/event\//i.test(sourceUrl.pathname)) {
    return parsePlayInParisEventHtml(html, url)
  }
  if (hostKey === 'meetup.com') return parseMeetupEventHtml(html, url)
  if (hostKey === 'eventbrite.fr') return parseEventbriteEventHtml(html, url)
  if (hostKey === 'feverup.com' && /^\/m\/\d+/i.test(sourceUrl.pathname)) {
    return parseFeverupEventHtml(html, url)
  }
  if (hostKey === 'paris.fr' && /\/evenements\//i.test(sourceUrl.pathname)) {
    return parseParisFrEventHtml(html, url)
  }

  return parseStructuredEventHtml(html, url, 'playinparis')
}

async function enrichSortir(activity: ScrapedActivity, html: string, sourceUrl: URL): Promise<ScrapedActivity> {
  let frenchHtml: string | undefined
  if (/\/zh\//i.test(sourceUrl.pathname)) {
    for (const frenchUrl of findSortirFrenchArticleUrls(html, sourceUrl.toString())) {
      try {
        const res = await fetch(frenchUrl, {
          headers: { Accept: 'text/html', 'User-Agent': activityLinkImportUserAgent },
          signal: AbortSignal.timeout(requestTimeoutMs),
        })
        if (!res.ok) continue
        const candidate = (await res.text()).slice(0, maxHtmlLength)
        if (extractSortirFrenchStreetAddress(candidate)) {
          frenchHtml = candidate
          break
        }
        frenchHtml ??= candidate
      } catch {
        /* try next */
      }
    }
  }
  return enrichSortirActivityAddress(activity, html, sourceUrl.toString(), frenchHtml)
}

async function enrichEventbrite(activity: ScrapedActivity, sourceUrl: URL): Promise<ScrapedActivity> {
  const eventId = extractEventbriteEventId(sourceUrl.toString())
  if (!eventId) return activity
  try {
    const structured = await fetchEventbriteStructuredContent(eventId, {
      userAgent: activityLinkImportUserAgent,
      timeoutMs: requestTimeoutMs,
    })
    if (!structured?.description) return activity
    return {
      ...activity,
      description: structured.description,
      itinerary: structured.itinerary ?? activity.itinerary,
    }
  } catch {
    return activity
  }
}

export function getSupportedLinkImportHosts(): string[] {
  return supportedHosts.map(([host]) => host)
}

export async function parseActivityLink(url: string): Promise<ApiParseResponse & { siteName?: string }> {
  let sourceUrl: URL
  try {
    sourceUrl = new URL(url.trim())
  } catch {
    return { success: false, data: {}, message: '链接格式无效' }
  }

  if (sourceUrl.protocol !== 'https:') {
    return { success: false, data: {}, message: '仅支持 https 链接' }
  }

  const siteName = getSupportedSiteName(sourceUrl)
  if (!siteName) {
    return {
      success: false,
      data: {},
      message: `暂不支持该网站。支持：${supportedHosts.map(([h]) => h).join('、')} 及 eventbrite 各域名`,
    }
  }

  let response: Response
  try {
    response = await fetch(sourceUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'User-Agent': activityLinkImportUserAgent,
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    })
  } catch {
    return { success: false, data: {}, message: '无法获取链接内容，建议上传截图或手动填写' }
  }

  if (!response.ok) {
    return { success: false, data: {}, message: `获取失败 (HTTP ${response.status})` }
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/json')) {
    return { success: false, data: {}, message: '不支持的内容类型' }
  }

  const html = (await response.text()).slice(0, maxHtmlLength)
  let activity = parseSiteSpecific(sourceUrl, html)

  if (!activity?.title) {
    return {
      success: false,
      data: {},
      message: '未能从页面提取活动信息，请手动填写或上传截图',
    }
  }

  const hostKey = getLinkImportHostKey(sourceUrl)
  if (hostKey === 'sortiraparis.com') {
    activity = await enrichSortir(activity, html, sourceUrl)
  }
  if (hostKey === 'eventbrite.fr') {
    activity = await enrichEventbrite(activity, sourceUrl)
  }

  const data = scrapedToParseResult(activity, sourceUrl.toString())
  const missing: string[] = []
  if (!data.title) missing.push('标题')
  if (!data.date) missing.push('时间')
  if (!data.location) missing.push('地点')
  if (!data.fee) missing.push('费用')

  const datePreview = data.date ? formatScrapedDateRange(data.date, data.dateEnd ?? null) : ''
  const extras: string[] = []
  if (datePreview) extras.push(`时间 ${datePreview}`)
  if (data.fee) extras.push(`费用 ${data.fee}`)
  if (data.category) extras.push(`类型 ${data.category}`)

  return {
    success: true,
    siteName,
    data,
    message:
      missing.length > 0
        ? `已从 ${siteName} 导入${extras.length ? `（${extras.join(' · ')}）` : ''}，请补充：${missing.join('、')}`
        : `已从 ${siteName} 导入：${extras.join(' · ') || '请确认并补充'}`,
  }
}
