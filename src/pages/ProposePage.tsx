import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { UserIdentityModal } from '../components/UserIdentityModal'
import { api } from '../lib/api'
import { getUser } from '../lib/user'

type InputMode = 'link' | 'image' | 'manual'

export function ProposePage() {
  const navigate = useNavigate()
  const user = getUser()
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
  const [location, setLocation] = useState('')
  const [organizerName, setOrganizerName] = useState(user?.name ?? '')
  const [organizerWechat, setOrganizerWechat] = useState(user?.wechat ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [identityModal, setIdentityModal] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (u) {
      setOrganizerName(u.name)
      setOrganizerWechat(u.wechat)
    }
  }, [])

  const handleParseUrl = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseMessage('')
    try {
      const res = await api.parse({ url: url.trim() })
      setParseSuccess(res.success)
      setParseMessage(res.message ?? (res.success ? '已自动提取信息，请确认并补充' : '未能提取内容，请手动填写'))
      if (res.data.title) setTitle(res.data.title)
      if (res.data.description) setDescription(res.data.description ?? '')
      if (res.data.location) setLocation(res.data.location ?? '')
      setSourceUrl(url.trim())
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
        if (res.data.title) setTitle(res.data.title)
        if (res.data.description) setDescription(res.data.description ?? '')
        if (res.data.location) setLocation(res.data.location ?? '')
      } catch {
        setParseSuccess(false)
        setParseMessage('解析失败，请手动填写')
      } finally {
        setParsing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('请填写活动/地点名称')
      return
    }
    setSubmitting(true)
    try {
      await api.createProposal({
        title: title.trim(),
        description: description.trim(),
        date: dateHint ? null : null,
        location: location.trim(),
        sourceUrl: sourceUrl.trim(),
        organizerName: organizerName.trim(),
        organizerWechat: organizerWechat.trim(),
        fee: '',
        notes: dateHint ? `大概时间：${dateHint}` : '',
      })
      setSubmitted(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center page-enter">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-3">提议已收到！</h2>
          <p className="text-gray-500 mb-8">
            大家会在首页看到你的提议。如果感兴趣的人多了，管理员会发起招募。
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-primary">回到首页</Link>
            <button type="button" className="btn-secondary" onClick={() => navigate(0)}>再提交一个</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <h1 className="text-2xl font-bold mb-1">分享一个好去处 💡</h1>
        <p className="text-gray-500 text-sm mb-6">有趣的活动、餐厅、景点都可以，大家一起决定要不要去</p>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(['link', 'image', 'manual'] as InputMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              <p className="text-gray-500">拖拽或点击上传截图 / 海报</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 5MB</p>
            </label>
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
            <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
            <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">大概时间（选填）</label>
            <input className="input-field" placeholder="如「周末」「下午」" value={dateHint} onChange={(e) => setDateHint(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">大概地点（选填）</label>
            <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-8">
          <h3 className="font-medium mb-3">留下联系方式（选填）</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">你的昵称</label>
              <input className="input-field" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="若成团可通知你" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">微信号</label>
              <input className="input-field" value={organizerWechat} onChange={(e) => setOrganizerWechat(e.target.value)} />
            </div>
          </div>
        </div>

        <button type="button" className="btn-primary w-full text-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交提议 🎉'}
        </button>
      </main>
      <UserIdentityModal open={identityModal} onClose={() => setIdentityModal(false)} />
    </div>
  )
}
