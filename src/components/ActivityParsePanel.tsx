'use client'

import { useState } from 'react'
import { api } from '../lib/api'
import type { ParseResult } from '../../shared/types'
import { ImageUploadZone } from './ImageUploadZone'

type InputMode = 'link' | 'image' | 'manual'

interface Props {
  onParsed: (data: Partial<ParseResult>) => void
  className?: string
}

export function ActivityParsePanel({ onParsed, className = '' }: Props) {
  const [mode, setMode] = useState<InputMode>('link')
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseMessage, setParseMessage] = useState('')
  const [parseSuccess, setParseSuccess] = useState<boolean | null>(null)

  const applyResult = (data: Partial<ParseResult>, sourceUrl?: string) => {
    onParsed({ ...data, ...(sourceUrl ? { sourceUrl } : {}) })
  }

  const handleParseUrl = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseMessage('')
    try {
      const res = await api.parse({ url: url.trim() })
      setParseSuccess(res.success)
      setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
      if (res.success) applyResult(res.data, url.trim())
    } catch {
      setParseSuccess(false)
      setParseMessage('解析失败，请手动填写或上传截图')
    } finally {
      setParsing(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setParsing(true)
    setParseMessage('')
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const res = await api.parse({ imageBase64: base64, mimeType: file.type })
        setParseSuccess(res.success)
        setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
        if (res.success) applyResult(res.data)
      } catch {
        setParseSuccess(false)
        setParseMessage('解析失败，请手动填写')
      } finally {
        setParsing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={className}>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {(['link', 'image', 'manual'] as InputMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              mode === m ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'
            }`}
            onClick={() => setMode(m)}
          >
            {m === 'link' ? '🔗 粘贴链接' : m === 'image' ? '🖼 上传图片' : '✏️ 直接填写'}
          </button>
        ))}
      </div>

      {mode === 'link' && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="粘贴活动链接..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="button" className="btn-primary shrink-0" onClick={handleParseUrl} disabled={parsing}>
              {parsing ? '...' : '解析'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            支持 SortirAParis、PlayInParis、Meetup、Eventbrite、Fever、Paris.fr 等
          </p>
        </div>
      )}

      {mode === 'image' && (
        <div className="mb-4">
          <ImageUploadZone
            onFile={handleImageUpload}
            parsing={parsing}
            hint="配置 CLAUDE_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY 之一"
          />
        </div>
      )}

      {parseMessage && (
        <div className={`text-sm mb-4 p-3 rounded-xl ${parseSuccess ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {parseSuccess ? '✅' : '⚠️'} {parseMessage}
        </div>
      )}
    </div>
  )
}
