import type { ApiParseResponse, EnvConfig } from '../../shared/types'

export const SYSTEM_PROMPT = `你是一个活动信息提取助手。从用户提供的网页文本或图片中提取活动/地点相关信息。

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

export type ParseProvider = 'claude' | 'openai' | 'gemini'

/** Free-tier friendly defaults; gemini-2.0-flash often has limit:0 on new projects */
const GEMINI_MODEL_DEFAULT = 'gemini-2.5-flash'
const GEMINI_MODEL_FALLBACKS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash']

export function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse JSON from AI response')
  }
}

export function hasAnyAiKey(env: EnvConfig): boolean {
  return Boolean(
    env.CLAUDE_API_KEY ||
    env.OPENAI_API_KEY ||
    env.GEMINI_API_KEY,
  )
}

export function resolveParseProvider(env: EnvConfig): ParseProvider | null {
  const mode = (env.PARSE_MODE ?? process.env.PARSE_MODE)?.toLowerCase()
  if (mode === 'mock') return null

  const pick = (provider: ParseProvider): ParseProvider | null => {
    if (provider === 'claude' && env.CLAUDE_API_KEY) return 'claude'
    if (provider === 'openai' && env.OPENAI_API_KEY) return 'openai'
    if (provider === 'gemini' && env.GEMINI_API_KEY) return 'gemini'
    return null
  }

  if (mode === 'claude' || mode === 'anthropic') return pick('claude')
  if (mode === 'openai' || mode === 'chatgpt' || mode === 'gpt') return pick('openai')
  if (mode === 'gemini' || mode === 'google') return pick('gemini')

  return pick('claude') ?? pick('openai') ?? pick('gemini')
}

function getProviderFallbackOrder(env: EnvConfig): ParseProvider[] {
  const primary = resolveParseProvider(env)
  const available: ParseProvider[] = []
  if (env.CLAUDE_API_KEY) available.push('claude')
  if (env.OPENAI_API_KEY) available.push('openai')
  if (env.GEMINI_API_KEY) available.push('gemini')
  if (!primary) return available
  return [primary, ...available.filter((p) => p !== primary)]
}

function isRetryableError(status: number, body: string): boolean {
  if (status === 429 || status === 503) return true
  return /quota|rate.?limit|RESOURCE_EXHAUSTED|overloaded/i.test(body)
}

function formatApiError(provider: ParseProvider, status: number, raw: string): string {
  const label = { claude: 'Claude', openai: 'OpenAI', gemini: 'Gemini' }[provider]
  try {
    const json = JSON.parse(raw) as { error?: { message?: string; status?: string; code?: number } }
    const msg = json.error?.message
    const exhausted =
      status === 429 ||
      json.error?.status === 'RESOURCE_EXHAUSTED' ||
      json.error?.code === 429

    if (exhausted) {
      if (provider === 'gemini') {
        return `${label} 免费配额已用尽或当前模型不可用。可尝试：① 设置 GEMINI_MODEL=gemini-1.5-flash；② 在 Google AI Studio 开通计费；③ 将 PARSE_MODE 改为 openai 或 claude`
      }
      return `${label} 请求频率或配额已用尽，请稍后重试或改用其他 PARSE_MODE`
    }
    if (msg) return `${label}: ${msg.split('\n')[0].slice(0, 200)}`
  } catch {
    /* raw text */
  }
  return `${label} API 错误 (HTTP ${status})`
}

export interface ParseAiInput {
  text?: string
  imageBase64?: string
  mimeType?: string
}

async function callClaude(env: EnvConfig, input: ParseAiInput): Promise<ApiParseResponse & { retryable?: boolean }> {
  const apiKey = env.CLAUDE_API_KEY
  if (!apiKey) return { success: false, data: {}, message: '未配置 CLAUDE_API_KEY' }

  const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = []
  if (input.imageBase64 && input.mimeType) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: input.mimeType, data: input.imageBase64 },
    })
  }
  content.push({
    type: 'text',
    text: input.text ?? '请从这张图片中提取活动/地点信息。',
  })

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
    const retryable = isRetryableError(res.status, err)
    return { success: false, data: {}, message: formatApiError('claude', res.status, err), retryable }
  }

  const result = await res.json() as { content: Array<{ type: string; text?: string }> }
  const text = result.content.find((c) => c.type === 'text')?.text ?? ''
  const data = extractJson(text)
  return { success: true, data: data as ApiParseResponse['data'] }
}

async function callOpenAI(env: EnvConfig, input: ParseAiInput): Promise<ApiParseResponse & { retryable?: boolean }> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) return { success: false, data: {}, message: '未配置 OPENAI_API_KEY' }

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = []
  if (input.imageBase64 && input.mimeType) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` },
    })
  }
  userContent.push({
    type: 'text',
    text: input.text ?? '请从这张图片中提取活动/地点信息。',
  })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    const retryable = isRetryableError(res.status, err)
    return { success: false, data: {}, message: formatApiError('openai', res.status, err), retryable }
  }

  const result = await res.json() as { choices: Array<{ message: { content?: string } }> }
  const text = result.choices[0]?.message?.content ?? ''
  const data = extractJson(text)
  return { success: true, data: data as ApiParseResponse['data'] }
}

function geminiModelsToTry(env: EnvConfig): string[] {
  const configured = env.GEMINI_MODEL ?? process.env.GEMINI_MODEL
  if (configured) {
    return [configured, ...GEMINI_MODEL_FALLBACKS.filter((m) => m !== configured)]
  }
  return GEMINI_MODEL_FALLBACKS
}

async function callGeminiWithModel(
  apiKey: string,
  model: string,
  input: ParseAiInput,
): Promise<{ ok: true; data: ApiParseResponse['data'] } | { ok: false; status: number; body: string; retryable: boolean }> {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    { text: `${SYSTEM_PROMPT}\n\n${input.text ?? '请从这张图片中提取活动/地点信息。'}` },
  ]
  if (input.imageBase64 && input.mimeType) {
    parts.push({ inline_data: { mime_type: input.mimeType, data: input.imageBase64 } })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  })

  if (!res.ok) {
    const body = await res.text()
    return { ok: false, status: res.status, body, retryable: isRetryableError(res.status, body) }
  }

  const result = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = result.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  if (!text) {
    return { ok: false, status: 502, body: 'empty response', retryable: false }
  }
  const data = extractJson(text)
  return { ok: true, data: data as ApiParseResponse['data'] }
}

async function callGemini(env: EnvConfig, input: ParseAiInput): Promise<ApiParseResponse & { retryable?: boolean }> {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) return { success: false, data: {}, message: '未配置 GEMINI_API_KEY' }

  let lastMessage = 'Gemini 请求失败'
  let lastRetryable = false

  for (const model of geminiModelsToTry(env)) {
    const result = await callGeminiWithModel(apiKey, model, input)
    if (result.ok) {
      return { success: true, data: result.data }
    }
    lastMessage = formatApiError('gemini', result.status, result.body)
    lastRetryable = result.retryable
    if (!result.retryable) break
  }

  return { success: false, data: {}, message: lastMessage, retryable: lastRetryable }
}

async function callProvider(
  provider: ParseProvider,
  env: EnvConfig,
  input: ParseAiInput,
): Promise<ApiParseResponse & { retryable?: boolean }> {
  switch (provider) {
    case 'claude':
      return callClaude(env, input)
    case 'openai':
      return callOpenAI(env, input)
    case 'gemini':
      return callGemini(env, input)
  }
}

const PROVIDER_LABEL: Record<ParseProvider, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  gemini: 'Gemini',
}

export async function callParseAi(env: EnvConfig, input: ParseAiInput): Promise<ApiParseResponse> {
  const order = getProviderFallbackOrder(env)
  if (order.length === 0) {
    return {
      success: false,
      data: {},
      message: '未配置 AI 解析：请设置 CLAUDE_API_KEY、OPENAI_API_KEY 或 GEMINI_API_KEY，并将 PARSE_MODE 设为对应 provider（或留空自动选择）',
    }
  }

  const errors: string[] = []

  for (const provider of order) {
    const result = await callProvider(provider, env, input)
    if (result.success) {
      const usedFallback = provider !== order[0]
      return {
        ...result,
        message: usedFallback
          ? `${PROVIDER_LABEL[provider]} 解析成功（${PROVIDER_LABEL[order[0]]} 不可用，已自动切换）`
          : result.message,
      }
    }
    errors.push(result.message ?? `${PROVIDER_LABEL[provider]} 失败`)
    if (!result.retryable) continue
  }

  return {
    success: false,
    data: {},
    message: errors[0] ?? 'AI 解析失败',
  }
}

export function aiConfigHint(): string {
  return '图片/链接 AI 解析支持 Claude、OpenAI (ChatGPT)、Gemini；Gemini 免费层建议 GEMINI_MODEL=gemini-2.5-flash 或 gemini-1.5-flash'
}
