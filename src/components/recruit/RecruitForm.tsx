import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import type {
  Activity,
  ActivityCategory,
  ActivityStatus,
  Difficulty,
  MealArrangement,
  ParseResult,
  ReservationMethod,
  TicketMethod,
} from '../../../shared/types'
import { api, getEventUrl } from '../../lib/api'
import { ACTIVITY_CATEGORIES } from '../../lib/categories'
import { applyParseResult } from '../../lib/parseResult'
import {
  clampParticipantInput,
  DEFAULT_MAX_PARTICIPANTS,
  DEFAULT_MIN_PARTICIPANTS,
  parseMaxParticipants,
  parseMinParticipants,
} from '../../lib/participants'
import { formatEventDate, getUser } from '../../lib/user'
import { ActivityParsePanel } from '../ActivityParsePanel'
import { DiningFields } from './DiningFields'
import { ParticipantLimitFields } from './ParticipantLimitFields'
import { SportsFields } from './SportsFields'
import { TicketFields } from './TicketFields'

const TICKET_KEYWORD = /购票|门票|票价|ticket/i

function hasTicketKeywords(title: string, description: string): boolean {
  return TICKET_KEYWORD.test(`${title} ${description}`)
}

interface Props {
  mode: 'public' | 'admin'
  initial?: Partial<Activity>
  sourceProposalId?: string
  editId?: string
  onSuccess?: (activity: Activity) => void
}

export function RecruitForm({ mode, initial, sourceProposalId, editId, onSuccess }: Props) {
  const dynamicRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date?.slice(0, 16) ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [minParticipants, setMinParticipants] = useState(
    String(initial?.minParticipants ?? DEFAULT_MIN_PARTICIPANTS),
  )
  const [maxParticipants, setMaxParticipants] = useState(() => {
    if (initial?.maxParticipants === null) return '0'
    if (initial?.maxParticipants != null) return String(initial.maxParticipants)
    return String(DEFAULT_MAX_PARTICIPANTS)
  })
  const [fee, setFee] = useState(initial?.fee ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [organizerName, setOrganizerName] = useState(initial?.organizerName ?? getUser()?.name ?? '')
  const [organizerWechat, setOrganizerWechat] = useState(initial?.organizerWechat ?? getUser()?.wechat ?? '')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [category, setCategory] = useState<ActivityCategory>(initial?.category ?? 'other')
  const [status, setStatus] = useState<ActivityStatus>(initial?.status ?? 'recruiting')
  const [ticketPrices, setTicketPrices] = useState(initial?.ticketPrices ?? '')
  const [ticketUrl, setTicketUrl] = useState(initial?.ticketUrl ?? '')
  const [ticketDeadline, setTicketDeadline] = useState(initial?.ticketDeadline?.slice(0, 16) ?? '')
  const [ticketMethod, setTicketMethod] = useState<TicketMethod | ''>(initial?.ticketMethod ?? '')
  const [refundPolicy, setRefundPolicy] = useState(initial?.refundPolicy ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>(initial?.difficulty ?? '')
  const [distanceAndDuration, setDistanceAndDuration] = useState(initial?.distanceAndDuration ?? '')
  const [itinerary, setItinerary] = useState(initial?.itinerary ?? '')
  const [equipment, setEquipment] = useState(initial?.equipment ?? '')
  const [transportation, setTransportation] = useState(initial?.transportation ?? '')
  const [mealArrangement, setMealArrangement] = useState<MealArrangement | ''>(initial?.mealArrangement ?? '')
  const [restaurantAddress, setRestaurantAddress] = useState(initial?.restaurantAddress ?? '')
  const [perPersonCost, setPerPersonCost] = useState(initial?.perPersonCost ?? '')
  const [reservationMethod, setReservationMethod] = useState<ReservationMethod | ''>(initial?.reservationMethod ?? '')
  const [requiresDeposit, setRequiresDeposit] = useState(initial?.requiresDeposit ?? false)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<Activity | null>(null)
  const [eventUrl, setEventUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (!initial) return
    setTitle(initial.title ?? '')
    setDescription(initial.description ?? '')
    setDate(initial.date?.slice(0, 16) ?? '')
    setLocation(initial.location ?? '')
    setMinParticipants(String(initial.minParticipants ?? DEFAULT_MIN_PARTICIPANTS))
    setMaxParticipants(
      initial.maxParticipants === null
        ? '0'
        : initial.maxParticipants != null
          ? String(initial.maxParticipants)
          : String(DEFAULT_MAX_PARTICIPANTS),
    )
    setFee(initial.fee ?? '')
    setNotes(initial.notes ?? '')
    setOrganizerName(initial.organizerName ?? getUser()?.name ?? '')
    setOrganizerWechat(initial.organizerWechat ?? getUser()?.wechat ?? '')
    setSourceUrl(initial.sourceUrl ?? '')
    setCategory(initial.category ?? 'other')
    setStatus(initial.status ?? 'recruiting')
    setTicketPrices(initial.ticketPrices ?? '')
    setTicketUrl(initial.ticketUrl ?? '')
    setTicketDeadline(initial.ticketDeadline?.slice(0, 16) ?? '')
    setTicketMethod(initial.ticketMethod ?? '')
    setRefundPolicy(initial.refundPolicy ?? '')
    setDifficulty(initial.difficulty ?? '')
    setDistanceAndDuration(initial.distanceAndDuration ?? '')
    setItinerary(initial.itinerary ?? '')
    setEquipment(initial.equipment ?? '')
    setTransportation(initial.transportation ?? '')
    setMealArrangement(initial.mealArrangement ?? '')
    setRestaurantAddress(initial.restaurantAddress ?? '')
    setPerPersonCost(initial.perPersonCost ?? '')
    setReservationMethod(initial.reservationMethod ?? '')
    setRequiresDeposit(initial.requiresDeposit ?? false)
  }, [initial])

  const showTicketFields =
    category === 'culture' ||
    category === 'other' ||
    hasTicketKeywords(title, description)
  const showSportsFields = category === 'sports'
  const showDiningFields = category === 'dining'

  const prevCategory = useRef(category)
  useEffect(() => {
    if (prevCategory.current !== category) {
      prevCategory.current = category
      dynamicRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [category])

  const handleDynamicChange = (field: keyof Activity, value: string | boolean) => {
    const setters: Record<string, (v: string | boolean) => void> = {
      ticketPrices: (v) => setTicketPrices(String(v)),
      ticketUrl: (v) => setTicketUrl(String(v)),
      ticketDeadline: (v) => setTicketDeadline(String(v)),
      ticketMethod: (v) => setTicketMethod(v as TicketMethod),
      refundPolicy: (v) => setRefundPolicy(String(v)),
      difficulty: (v) => setDifficulty(v as Difficulty),
      distanceAndDuration: (v) => setDistanceAndDuration(String(v)),
      itinerary: (v) => setItinerary(String(v)),
      equipment: (v) => setEquipment(String(v)),
      transportation: (v) => setTransportation(String(v)),
      mealArrangement: (v) => setMealArrangement(v as MealArrangement),
      restaurantAddress: (v) => setRestaurantAddress(String(v)),
      perPersonCost: (v) => setPerPersonCost(String(v)),
      reservationMethod: (v) => setReservationMethod(v as ReservationMethod),
      requiresDeposit: (v) => setRequiresDeposit(Boolean(v)),
    }
    setters[field]?.(value)
  }

  const handleParsed = (data: Partial<ParseResult> & { sourceUrl?: string }) => {
    applyParseResult(data, {
      setTitle,
      setDescription,
      setLocation,
      setSourceUrl,
      setFee,
      setNotes,
      setMaxParticipants: (v) => setMaxParticipants(clampParticipantInput(String(v))),
      setDate,
      setCategory,
      setItinerary,
    }, { getNotes: () => notes })
  }

  const buildPayload = (): Partial<Activity> => {
    const min = parseMinParticipants(minParticipants)
    const max = parseMaxParticipants(maxParticipants)

    return {
    title: title.trim(),
    description: description.trim(),
    date: date ? new Date(date).toISOString() : null,
    location: location.trim(),
    minParticipants: min,
    maxParticipants: max,
    fee: fee.trim(),
    notes: notes.trim(),
    organizerName: organizerName.trim(),
    organizerWechat: organizerWechat.trim(),
    sourceUrl: sourceUrl.trim(),
    category,
    status: mode === 'admin' ? status : 'recruiting',
    ticketPrices: ticketPrices.trim() || undefined,
    ticketUrl: ticketUrl.trim() || undefined,
    ticketDeadline: ticketDeadline ? new Date(ticketDeadline).toISOString() : undefined,
    ticketMethod: ticketMethod || undefined,
    refundPolicy: refundPolicy.trim() || undefined,
    difficulty: difficulty || undefined,
    distanceAndDuration: distanceAndDuration.trim() || undefined,
    itinerary: itinerary.trim() || undefined,
    equipment: equipment.trim() || undefined,
    transportation: transportation.trim() || undefined,
    mealArrangement: mealArrangement || undefined,
    restaurantAddress: restaurantAddress.trim() || undefined,
    perPersonCost: perPersonCost.trim() || undefined,
    reservationMethod: reservationMethod || undefined,
    requiresDeposit: requiresDeposit || undefined,
  }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !organizerName.trim() || !organizerWechat.trim()) {
      alert('请填写标题、发起人昵称和微信号')
      return
    }
    if (!date || !location.trim()) {
      alert('请填写活动时间和地点')
      return
    }
    const min = parseMinParticipants(minParticipants)
    const max = parseMaxParticipants(maxParticipants)
    if (max != null && min > max) {
      alert('最少人数不能大于最多人数')
      return
    }
    setSubmitting(true)
    const data = buildPayload()
    try {
      if (mode === 'public') {
        const res = await api.createRecruitment({
          ...data,
          sourceProposalId,
        })
        setCreated(res.activity)
        setEventUrl(res.eventUrl || getEventUrl(res.activity.id))
        const url = res.eventUrl || getEventUrl(res.activity.id)
        const qr = await QRCode.toDataURL(url, { width: 200 })
        setQrDataUrl(qr)
        onSuccess?.(res.activity)
      } else {
        const result = editId
          ? await api.updateActivity(editId, data)
          : await api.createActivity(data)
        if (editId) {
          onSuccess?.(result)
          alert('活动已更新')
          return
        }
        setCreated(result)
        const url = getEventUrl(result.id)
        setEventUrl(url)
        const qr = await QRCode.toDataURL(url, { width: 200 })
        setQrDataUrl(qr)
        onSuccess?.(result)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    const url = eventUrl || getEventUrl(created.id)
    return (
      <div className="text-center py-8 page-enter">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold mb-4">招募已创建</h3>
        <p className="text-sm text-gray-600 mb-2 break-all">报名链接：{url}</p>
        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          <button type="button" className="btn-primary" onClick={() => navigator.clipboard.writeText(url)}>
            复制链接
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigator.clipboard.writeText(created.organizerWechat)}
          >
            复制微信号
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">分享链接到微信群，让朋友扫码报名</p>
        {qrDataUrl && (
          <div>
            <p className="text-sm text-gray-500 mb-2">报名二维码</p>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-lg">
      {mode === 'admin' && !editId && (
        <ActivityParsePanel onParsed={handleParsed} className="border-b border-gray-100 pb-4 mb-2" />
      )}
      {mode === 'public' && !editId && !sourceProposalId && (
        <ActivityParsePanel onParsed={handleParsed} className="border-b border-gray-100 pb-4 mb-2" />
      )}
      <div>
        <label className="text-sm text-gray-600 mb-1 block">活动名称 *</label>
        <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">简介</label>
        <textarea className="input-field min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
        <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">活动类型 *</label>
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>
      <div className={mode === 'admin' ? 'grid grid-cols-2 gap-3' : ''}>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">活动时间 *</label>
          <input type="datetime-local" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">如：2026-06-15 09:00</p>
          {date && (
            <p className="text-xs text-green-600 mt-0.5">{formatEventDate(new Date(date).toISOString())}</p>
          )}
        </div>
        {mode === 'admin' && (
          <div>
            <label className="text-sm text-gray-600 mb-1 block">状态</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as ActivityStatus)}>
              <option value="proposed">提议池</option>
              <option value="recruiting">招募中</option>
              <option value="ended">已结束</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">地点 *</label>
        <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <ParticipantLimitFields
        min={minParticipants}
        max={maxParticipants}
        onMinChange={setMinParticipants}
        onMaxChange={setMaxParticipants}
      />
      <div>
        <label className="text-sm text-gray-600 mb-1 block">费用说明</label>
        <input className="input-field" value={fee} onChange={(e) => setFee(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">注意事项</label>
        <textarea className="input-field min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="多条用换行分隔" />
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

      <div ref={dynamicRef}>
        {showTicketFields && (
          <TicketFields
            ticketPrices={ticketPrices}
            ticketUrl={ticketUrl}
            ticketDeadline={ticketDeadline}
            ticketMethod={ticketMethod}
            refundPolicy={refundPolicy}
            onChange={handleDynamicChange}
          />
        )}
        {showSportsFields && (
          <SportsFields
            difficulty={difficulty}
            distanceAndDuration={distanceAndDuration}
            equipment={equipment}
            transportation={transportation}
            mealArrangement={mealArrangement}
            onChange={handleDynamicChange}
          />
        )}
        {showDiningFields && (
          <DiningFields
            restaurantAddress={restaurantAddress}
            perPersonCost={perPersonCost}
            reservationMethod={reservationMethod}
            requiresDeposit={requiresDeposit}
            onChange={handleDynamicChange}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">发起人昵称 *</label>
          <input className="input-field" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">发起人微信号 *</label>
          <input className="input-field" value={organizerWechat} onChange={(e) => setOrganizerWechat(e.target.value)} />
        </div>
      </div>
      <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? '保存中...' : editId ? '更新活动' : mode === 'public' ? '发布招募' : '创建活动'}
      </button>
    </div>
  )
}
