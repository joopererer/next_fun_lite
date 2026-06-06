import type { ApiParseResponse, EnvConfig } from '../../shared/types'
import { parseActivityLink } from '../lib/linkImport/parseActivityLink'
import { aiConfigHint, callParseAi, hasAnyAiKey, resolveParseProvider } from '../lib/parseAi'
import { jsonResponse, parseBody } from '../lib/utils'

const MOCK_DATA: ApiParseResponse = {
  success: true,
  data: {
    title: '示例活动',
    description: '这是一个从链接自动提取的示例活动描述，请确认并补充详细信息。',
    date: null,
    location: 'Paris',
    maxParticipants: null,
    fee: null,
    notes: null,
  },
}

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextFunLite/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000)
  } finally {
    clearTimeout(timeout)
  }
}

function isMockMode(env: EnvConfig): boolean {
  const mode = (env.PARSE_MODE ?? process.env.PARSE_MODE)?.toLowerCase()
  if (mode === 'mock') return true
  return !hasAnyAiKey(env)
}

export async function handleParse(request: Request, env: EnvConfig): Promise<Response> {
  const body = await parseBody<{ url?: string; imageBase64?: string; mimeType?: string }>(request)

  if (isMockMode(env)) {
    if (body.imageBase64 && body.mimeType) {
      return jsonResponse({
        success: false,
        data: {},
        message: `图片识别需配置 AI Key 并设置 PARSE_MODE。${aiConfigHint()}`,
      })
    }
    if (body.url) {
      try {
        const structured = await parseActivityLink(body.url)
        if (structured.success) return jsonResponse(structured)
        if (structured.message) {
          return jsonResponse({ success: false, data: {}, message: structured.message })
        }
      } catch {
        /* fall through to mock */
      }
    }
    return jsonResponse(MOCK_DATA)
  }

  const provider = resolveParseProvider(env)

  try {
    if (body.imageBase64 && body.mimeType) {
      const result = await callParseAi(env, {
        imageBase64: body.imageBase64,
        mimeType: body.mimeType,
      })
      return jsonResponse(result)
    }

    if (body.url) {
      try {
        const structured = await parseActivityLink(body.url)
        if (structured.success) return jsonResponse(structured)
      } catch {
        /* fall through to AI */
      }

      let pageText: string
      try {
        pageText = await fetchPageText(body.url)
      } catch {
        return jsonResponse({
          success: false,
          data: {},
          message: '无法获取链接内容，建议上传截图或手动填写',
        })
      }

      const result = await callParseAi(env, {
        text: `链接：${body.url}\n\n网页文本：\n${pageText}`,
      })
      return jsonResponse({
        ...result,
        message: result.message ?? (result.success ? `已通过 ${provider} 提取信息，请确认并补充` : undefined),
      })
    }

    return jsonResponse({ success: false, data: {}, message: '请提供链接或图片' })
  } catch (err) {
    return jsonResponse({
      success: false,
      data: {},
      message: err instanceof Error ? err.message : '解析失败',
    })
  }
}
