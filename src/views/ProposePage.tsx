'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SignInGate } from '../components/SignInGate'
import type { SimilarProposalMatch } from '../../shared/activityDedupe'
import type { ActivityCategory, FeeLevel, ParseResult } from '../../shared/types'
import { SimilarProposalsDialog } from '../components/SimilarProposalsDialog'
import { api } from '../lib/api'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../lib/validateSchedule'
import { ACTIVITY_CATEGORIES } from '../lib/categories'
import { FEE_LEVELS } from '../lib/feeLevel'
import { getClerkDisplayName } from '../lib/displayName'
import { applyParseResult } from '../lib/parseResult'
import { ImageUploadZone } from '../components/ImageUploadZone'

type InputMode = 'link' | 'image' | 'manual'

export function ProposePage() {
  const { user: clerkUser } = useUser()
  const [mode, setMode] = useState<InputMode>('link')
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseMessage, setParseMessage] = useState('')
  const [parseSuccess, setParseSuccess] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [dateHint, setDateHint] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<ActivityCategory>('other')
  const [feeLevel, setFeeLevel] = useState<FeeLevel>('unknown')
  const [feeDetail, setFeeDetail] = useState('')
  const [itinerary, setItinerary] = useState('')
  const [organizerWechat, setOrganizerWechat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkingSimilar, setCheckingSimilar] = useState(false)
  const [similarMatches, setSimilarMatches] = useState<SimilarProposalMatch[]>([])
  const [similarDialogOpen, setSimilarDialogOpen] = useState(false)

  useEffect(() => {
    if (!clerkUser) return
    api.getProfile()
      .then((p) => {
        if (p?.wechat) setOrganizerWechat(p.wechat)
      })
      .catch(() => {})
  }, [clerkUser])

  const applyParsed = (data: Partial<ParseResult> & { sourceUrl?: string }) => {
    applyParseResult(data, {
      setTitle,
      setDescription,
      setLocation,
      setSourceUrl,
      setDateHint,
      setDateEnd,
      setCategory,
      setFeeLevel,
      setFee: setFeeDetail,
      setItinerary,
    }, { dateHintOnly: true })
  }

  const selectFeeLevel = (level: FeeLevel) => {
    setFeeLevel(level)
    if (level !== 'paid' && level !== 'low') setFeeDetail('')
  }

  const handleParseUrl = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseMessage('')
    try {
      const res = await api.parse({ url: url.trim() })
      setParseSuccess(res.success)
      setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
      if (res.success) applyParsed({ ...res.data, sourceUrl: url.trim() })
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
        if (res.success) applyParsed(res.data)
      } catch {
        setParseSuccess(false)
        setParseMessage('解析失败，请手动填写')
      } finally {
        setParsing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const buildProposalPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    date: dateHint ? null : null,
    location: location.trim(),
    sourceUrl: sourceUrl.trim(),
    category,
    feeLevel,
    organizerWechat: organizerWechat.trim(),
    fee: feeDetail.trim(),
    itinerary: itinerary.trim() || undefined,
    notes: dateHint ? `大概时间：${dateHint}` : '',
    dateEnd: dateEnd ? new Date(dateEnd).toISOString() : null,
  })

  const submitProposal = async () => {
    setSubmitting(true)
    try {
      await api.createProposal(buildProposalPayload())
      setSubmitted(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('请填写活动/地点名称')
      return
    }
    if (isEndTimeInPast(dateEnd || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
      return
    }

    setCheckingSimilar(true)
    try {
      const { matches } = await api.findSimilarProposals({
        title: title.trim(),
        location: location.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      })
      if (matches.length > 0) {
        setSimilarMatches(matches)
        setSimilarDialogOpen(true)
        return
      }
      await submitProposal()
    } catch (err) {
      alert(err instanceof Error ? err.message : '检查相似提议失败，请稍后重试')
    } finally {
      setCheckingSimilar(false)
    }
  }

  const handleConfirmSimilar = async () => {
    await submitProposal()
    setSimilarDialogOpen(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center page-enter w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-3">提议已收到！</h2>
          <p className="text-gray-500 mb-8">
            大家会在首页看到你的提议。如果感兴趣的人多了，管理员会发起招募。
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary">回到首页</Link>
            <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>再提交一个</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate message="登录后即可提交提议">
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <h1 className="text-2xl font-bold mb-1">分享一个好去处 💡</h1>
        <p className="text-gray-500 text-sm mb-6">有趣的活动、餐厅、景点都可以，大家一起决定要不要去</p>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
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
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="粘贴小红书、Sortir A Paris、PlayInParis、Eventbrite、任意链接..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button type="button" className="btn-primary shrink-0" onClick={handleParseUrl} disabled={parsing}>
                {parsing ? '...' : '解析'}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ 小红书链接提示：如解析失败，可将页面文字复制粘贴到下方「活动介绍」，或切换到「上传图片」模式。
            </p>
          </div>
        )}

        {mode === 'image' && (
          <div className="mb-6">
            <ImageUploadZone
              onFile={handleImageUpload}
              parsing={parsing}
              hint="图片/链接 AI 解析支持 Claude、OpenAI、Gemini，配置 API Key 并设置 PARSE_MODE"
            />
          </div>
        )}

        {parseMessage && (
          <div className={`text-sm mb-4 p-3 rounded-xl ${parseSuccess ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {parseSuccess ? '✅' : '⚠️'} {parseMessage}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">活动/地点名称 *</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">简介</label>
            <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">行程（选填）</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder={'18:30 集合\n19:00 开始活动\n21:30 自由交流'}
              value={itinerary}
              onChange={(e) => setItinerary(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">每行一个时间节点，粘贴链接解析后会自动填入</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
            <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">大概时间（选填）</label>
            <input className="input-field" placeholder="如「周末」「下午」" value={dateHint} onChange={(e) => setDateHint(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">信息有效期至（选填）</label>
            <input type="datetime-local" className="input-field" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">如展览结束日；过期后显示标签，由管理员或提议人处理</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">活动类型</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">大概地点（选填）</label>
            <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">费用水平</label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_LEVELS.map((f) => (
                <label
                  key={f.value}
                  className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    feeLevel === f.value ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="feeLevel"
                    value={f.value}
                    checked={feeLevel === f.value}
                    onChange={() => selectFeeLevel(f.value)}
                    className="sr-only"
                  />
                  <span className="mt-0.5">{f.emoji}</span>
                  <span className="text-sm min-w-0">
                    <span className="block">{f.label}</span>
                    {feeLevel === f.value && feeDetail && (f.value === 'paid' || f.value === 'free' || f.value === 'low') && (
                      <span className="block text-xs text-green-700 mt-1 font-normal break-words">
                        {feeDetail}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {feeLevel === 'paid' && (
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">费用说明（可编辑）</label>
                <input
                  className="input-field text-sm"
                  placeholder="如：预算区间 · 58.86 – 116.52 EUR"
                  value={feeDetail}
                  onChange={(e) => setFeeDetail(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-8">
          <h3 className="font-medium mb-3">联系方式</h3>
          <p className="text-sm text-gray-500 mb-3">
            以 <span className="font-medium text-gray-700">{getClerkDisplayName(clerkUser)}</span> 的身份提交
          </p>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">微信号（可选）</label>
            <input className="input-field" value={organizerWechat} onChange={(e) => setOrganizerWechat(e.target.value)} placeholder="若成团方便联系你" />
          </div>
        </div>

        <button
          type="button"
          className="btn-primary w-full text-lg"
          onClick={handleSubmit}
          disabled={submitting || checkingSimilar}
        >
          {checkingSimilar ? '检查中...' : submitting ? '提交中...' : '提交提议 🎉'}
        </button>
      </main>
      </SignInGate>
      <SimilarProposalsDialog
        open={similarDialogOpen}
        matches={similarMatches}
        onConfirm={handleConfirmSimilar}
        onCancel={() => setSimilarDialogOpen(false)}
        confirming={submitting}
      />
      <Footer />
    </div>
  )
}
