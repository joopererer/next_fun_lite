import { useState } from 'react'
import { api } from '../lib/api'
import type { ParseResult } from '../../shared/types'

type InputMode = 'link' | 'image' | 'manual'

interface Props {
  onParsed: (data: Partial<ParseResult> & { sourceUrl?: string }) => void
  className?: string
}

export function ActivityParsePanel({ onParsed, className = '' }: Props) {
  const [mode, setMode] = useState<InputMode>('link')
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseMessage, setParseMessage] = useState('')
  const [parseSuccess, setParseSuccess] = useState<boolean | null>(null)

  const applyResult = (data: Partial<ParseResult>, sourceUrl?: string) => {
    onParsed({ ...data, sourceUrl })
  }

  const handleParseUrl = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseMessage('')
    try {
      const res = await api.parse({ url: url.trim() })
      setParseSuccess(res.success)
      setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
      applyResult(res.data, url.trim())
    } catch {
      setParseSuccess(false)
      setParseMessage('解析失败，请手动填写或上传截图')
    } finally {
      setParsing(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('图片最大 5MB')
      return
    }
    setParsing(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const res = await api.parse({ imageBase64: base64, mimeType: file.type })
        setParseSuccess(res.success)
        setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
        applyResult(res.data)
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
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            <p className="text-gray-500 text-sm">拖拽或点击上传截图 / 海报</p>
            <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 5MB</p>
          </label>
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
