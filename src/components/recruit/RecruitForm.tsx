'use client'

import QRCode from 'qrcode'
import { useUser } from '@clerk/nextjs'
import { useEffect, useRef, useState } from 'react'
import type {
  Activity,
  ActivityCategory,
  ActivityStatus,
  Difficulty,
  MealArrangement,
  OrganizerContactType,
  ParseResult,
  ReservationMethod,
  TicketMethod,
} from '../../../shared/types'
import { resolveOrganizerContact } from '../../../shared/contact'
import { OrganizerContactFields } from '../contact/OrganizerContactFields'
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
import { formatEventDate } from '../../lib/user'
import { getClerkDisplayName } from '../../lib/displayName'
import { buildRecruitGroupMessage } from '../../lib/recruitShareMessage'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../../lib/validateSchedule'
import { ActivityParsePanel } from '../ActivityParsePanel'
import { DiningFields } from './DiningFields'
import { ParticipantLimitFields } from './ParticipantLimitFields'
import { SportsFields } from './SportsFields'
import { TicketFields } from './TicketFields'

const TICKET_KEYWORD = /购票|门票|票价|ticket/i

function hasTicketKeywords(title: string, description: string): boolean {
  return TICKET_KEYWORD.test(`${title} ${description}`)
}

function initOrganizerContact(initial?: Partial<Activity>) {
  const resolved = resolveOrganizerContact(initial ?? {})
  return {
    type: resolved.type,
    contact: resolved.contact,
    label: resolved.label ?? '',
  }
}

interface Props {
  mode: 'public' | 'admin' | 'organizer'
  initial?: Partial<Activity>
  sourceProposalId?: string
  sourceInfoId?: string
  sourceProposalTitle?: string
  sourceInterestedCount?: number
  editId?: string
  onSuccess?: (activity: Activity) => void
}

export function RecruitForm({
  mode,
  initial,
  sourceProposalId,
  sourceInfoId,
  sourceProposalTitle,
  sourceInterestedCount,
  editId,
  onSuccess,
}: Props) {
  const { isSignedIn, user: clerkUser } = useUser()
  const dynamicRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date?.slice(0, 16) ?? '')
  const [dateEnd, setDateEnd] = useState(initial?.dateEnd?.slice(0, 16) ?? '')
  const [registrationDeadline, setRegistrationDeadline] = useState(initial?.registrationDeadline?.slice(0, 16) ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [meetingLocation, setMeetingLocation] = useState(initial?.meetingLocation ?? '')
  const [meetingTime, setMeetingTime] = useState(initial?.meetingTime ?? '')
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
  const [organizerName, setOrganizerName] = useState(initial?.organizerName ?? '')
  const [organizerContactType, setOrganizerContactType] = useState<OrganizerContactType>(
    () => initOrganizerContact(initial).type,
  )
  const [organizerContact, setOrganizerContact] = useState(() => initOrganizerContact(initial).contact)
  const [organizerContactLabel, setOrganizerContactLabel] = useState(
    () => initOrganizerContact(initial).label,
  )
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
    if (!isSignedIn || !clerkUser) return
    setOrganizerName(getClerkDisplayName(clerkUser))
    api.getProfile()
      .then((profile) => {
        if (profile?.wechat) {
          setOrganizerContactType('wechat')
          setOrganizerContact(profile.wechat)
        } else if (profile?.email) {
          setOrganizerContactType('email')
          setOrganizerContact(profile.email)
        }
      })
      .catch(() => {})
  }, [isSignedIn, clerkUser])

  useEffect(() => {
    if (!initial) return
    setTitle(initial.title ?? '')
    setDescription(initial.description ?? '')
    setDate(initial.date?.slice(0, 16) ?? '')
    setDateEnd(initial.dateEnd?.slice(0, 16) ?? '')
    setRegistrationDeadline(initial.registrationDeadline?.slice(0, 16) ?? '')
    setLocation(initial.location ?? '')
    setMeetingLocation(initial.meetingLocation ?? '')
    setMeetingTime(initial.meetingTime ?? '')
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
    setOrganizerName(initial.organizerName ?? '')
    const contact = initOrganizerContact(initial)
    setOrganizerContactType(contact.type)
    setOrganizerContact(contact.contact)
    setOrganizerContactLabel(contact.label)
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
      setDateEnd,
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
    dateEnd: dateEnd ? new Date(dateEnd).toISOString() : null,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
    location: location.trim(),
    meetingLocation: meetingLocation.trim() || undefined,
    meetingTime: meetingTime.trim() || undefined,
    minParticipants: min,
    maxParticipants: max,
    fee: fee.trim(),
    notes: notes.trim(),
    organizerName: organizerName.trim(),
    organizerContactType,
    organizerContact: organizerContactType === 'private' ? '' : organizerContact.trim(),
    organizerContactLabel: organizerContactType === 'other' ? organizerContactLabel.trim() : undefined,
    organizerWechat: organizerContactType === 'wechat' ? organizerContact.trim() : '',
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
    if (!title.trim()) {
      alert('请填写标题')
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
    if (isEndTimeInPast(dateEnd || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
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
      } else if (mode === 'organizer') {
        if (!editId) {
          alert('缺少活动 ID')
          return
        }
        const result = await api.updateActivity(editId, data)
        onSuccess?.(result)
        alert('活动已更新')
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
    const groupMessage = buildRecruitGroupMessage({
      title: created.title,
      date: created.date,
      location: created.location,
      eventUrl: url,
      proposalTitle: sourceProposalTitle,
      interestedCount: sourceInterestedCount,
    })
    return (
      <div className="text-center py-8 page-enter">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold mb-4">招募已创建</h3>
        {sourceProposalId && (sourceInterestedCount ?? 0) > 0 && (
          <div className="bg-blue-50 text-blue-900 text-sm rounded-xl p-4 mb-4 text-left">
            <p className="font-medium mb-1">
              💡 原提议「{sourceProposalTitle}」有 {sourceInterestedCount} 人曾表示感兴趣
            </p>
            <p className="text-blue-800/80">可复制下方群消息，发到微信群提醒他们来报名（不会自动替他们报名）。</p>
          </div>
        )}
        <p className="text-sm text-gray-600 mb-2 break-all">报名链接：{url}</p>
        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          <button type="button" className="btn-primary" onClick={() => navigator.clipboard.writeText(url)}>
            复制链接
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigator.clipboard.writeText(groupMessage)}>
            复制群消息
          </button>
          {created.organizerContactType === 'wechat' && created.organizerContact && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigator.clipboard.writeText(created.organizerContact!)}
            >
              复制微信号
            </button>
          )}
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
      {mode === 'public' && !editId && !sourceProposalId && !sourceInfoId && (
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
              <option value="ended_success">已结束</option>
              <option value="ended_cancelled">已取消</option>
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">结束时间（选填）</label>
          <input type="datetime-local" className="input-field" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">留空则开始日当天 23:59（巴黎时间）视为结束</p>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">报名截止（选填）</label>
          <input type="datetime-local" className="input-field" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">留空则活动开始前均可报名</p>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">活动地点 *</label>
        <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="活动举办的主要地点" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">集合地点（选填）</label>
        <input className="input-field" value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} placeholder="如与活动地点不同，填写集合出发地点" />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">集合时间（选填）</label>
        <input className="input-field" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} placeholder="如 09:00，如需提前集合请填写" />
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

      <div>
        <label className="text-sm text-gray-600 mb-1 block">发起人</label>
        {isSignedIn ? (
          <div className="input-field bg-gray-50 text-gray-700">{organizerName || '你的账号'}</div>
        ) : (
          <input className="input-field" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
        )}
      </div>
      <OrganizerContactFields
        contactType={organizerContactType}
        contact={organizerContact}
        contactLabel={organizerContactLabel}
        onTypeChange={setOrganizerContactType}
        onContactChange={setOrganizerContact}
        onLabelChange={setOrganizerContactLabel}
      />
      <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? '保存中...' : editId ? (mode === 'organizer' ? '保存修改' : '更新活动') : mode === 'public' ? '发布招募' : '创建活动'}
      </button>
    </div>
  )
}
