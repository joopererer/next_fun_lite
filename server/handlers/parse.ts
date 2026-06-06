import type { ApiParseResponse, EnvConfig } from '../../shared/types'
import { parseActivityLink } from '../lib/linkImport/parseActivityLink'
import { jsonResponse, parseBody } from '../lib/utils'

const SYSTEM_PROMPT = `你是一个活动信息提取助手。从用户提供的网页文本或图片中提取活动/地点相关信息。

只返回纯 JSON，不要有任何其他文字、解释或 markdown 代码块：
{
  "title": "活动或地点名称",
  "description": "简介，保留重要细节，去除广告和无关内容，200字以内",
  "date": "YYYY-MM-DDTHH:mm 或 null",
  "location": "地点或集合地点",
  "maxParticipants": null 或数字,
  "fee": "费用说明，如无则 null",
  "itinerary": "活动行程/时间安排，每行一个节点，如无则 null",
  "notes": "注意事项，多条用换行分隔，如无则 null"
}

无法提取的字段值设为 null。日期转为 ISO 格式。内容为中文时保持中文输出。`

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

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse JSON from Claude response')
  }
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

async function callClaude(
  env: EnvConfig,
  content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>
): Promise<ApiParseResponse> {
  const apiKey = env.CLAUDE_API_KEY
  if (!apiKey) {
    return { ...MOCK_DATA, message: 'No API key, using mock data' }
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return { success: false, data: {}, message: `Claude API error: ${err}` }
  }

  const result = await res.json() as { content: Array<{ type: string; text?: string }> }
  const text = result.content.find((c) => c.type === 'text')?.text ?? ''
  const data = extractJson(text)
  return { success: true, data: data as ApiParseResponse['data'] }
}

export async function handleParse(request: Request, env: EnvConfig): Promise<Response> {
  const body = await parseBody<{ url?: string; imageBase64?: string; mimeType?: string }>(request)
  const parseMode = env.PARSE_MODE ?? process.env.PARSE_MODE

  if (parseMode === 'mock' || (!env.CLAUDE_API_KEY && !process.env.CLAUDE_API_KEY)) {
    if (body.imageBase64 && body.mimeType) {
      return jsonResponse({
        success: false,
        data: {},
        message: '图片识别需配置 CLAUDE_API_KEY 并关闭 mock 模式（PARSE_MODE 留空或设为 claude）。当前仅支持 Claude API，不支持 Gemini/ChatGPT',
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

  try {
    if (body.imageBase64 && body.mimeType) {
      const result = await callClaude(env, [{
        type: 'image',
        source: { type: 'base64', media_type: body.mimeType, data: body.imageBase64 },
      }, {
        type: 'text',
        text: '请从这张图片中提取活动/地点信息。',
      }])
      return jsonResponse(result)
    }

    if (body.url) {
      try {
        const structured = await parseActivityLink(body.url)
        if (structured.success) return jsonResponse(structured)
      } catch {
        /* fall through to Claude */
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

      const result = await callClaude(env, [{
        type: 'text',
        text: `链接：${body.url}\n\n网页文本：\n${pageText}`,
      }])
      return jsonResponse(result)
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
