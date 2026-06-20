'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ActivityWithCount, Profile, Registration } from '../../shared/types'
import { ItineraryBlock } from '../components/ItineraryBlock'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { RegistrationModal } from '../components/RegistrationModal'
import { RegistrationPreview } from '../components/RegistrationPreview'
import { api, getCancelUrl } from '../lib/api'
import { getCancelReasonLabel, isEndedCancelled, isEndedSuccess } from '../lib/activityStatus'
import { getCategoryEmoji } from '../lib/categories'
import { getClerkDisplayName } from '../lib/displayName'
import { formatEventDate, formatEventDateRange } from '../lib/user'
import { CapacityBar } from '../components/CapacityBar'
import { ActivityBadge } from '../components/ActivityBadge'
import { WeatherWidget } from '../components/WeatherWidget'
import { getDeviceId } from '../utils/device'
import { canRegister, getActivityBadge, isInProgress, isProposalExpired, getActivityTags, TAG_LABELS, isMultiDay } from '../lib/activityPhase'
import { notifyActivitiesChanged } from '../lib/activityEvents'
import { useT, useLang } from '../i18n/LanguageContext'
import { getCatLabel } from '../components/CategoryFilter'
import { saveGuestRegistration, removeGuestRegistration, getGuestRegistrations } from '../lib/guestRegistrations'
import { addRegistrationId, removeRegistrationId } from '../lib/registrations'
import { formatOrganizerContactHint, resolveOrganizerContact } from '../lib/contact'
import { isInfoPost } from '../../shared/infoVisibility'
import { InfoEventSection } from '../components/InfoEventSection'
import { OrganizerEditBar } from '../components/OrganizerEditBar'
import { AddToCalendarButton } from '../components/AddToCalendarButton'
import { buildActivityCalendarEvent } from '../lib/calendarEvents'

interface EventPageProps {
  initialActivity?: ActivityWithCount
}

export function EventPage({ initialActivity }: EventPageProps = {}) {
  const { id: routeId } = useParams<{ id: string }>()
  const id = routeId ?? initialActivity?.id
  const { isSignedIn, isLoaded, user: clerkUser } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activity, setActivity] = useState<ActivityWithCount | null>(initialActivity ?? null)
  const [loading, setLoading] = useState(!initialActivity)
  const [notFound, setNotFound] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredCount, setRegisteredCount] = useState(initialActivity?.registeredCount ?? 0)
  const [cancelToken, setCancelToken] = useState<string | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [regSummary, setRegSummary] = useState<{ total: number; previews: Array<{ name: string; avatarUrl: string | null }> }>({
    total: 0,
    previews: [],
  })
  const [summaryLoading, setSummaryLoading] = useState(true)

  const [participantCount, setParticipantCount] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [interested, setInterested] = useState(false)
  const [interestCount, setInterestCount] = useState(0)
  const [interestLoading, setInterestLoading] = useState(false)
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [sourceProposal, setSourceProposal] = useState<ActivityWithCount | null | undefined>(undefined)
  const [linkedRecruits, setLinkedRecruits] = useState<ActivityWithCount[]>([])

  const t = useT()
  const { lang } = useLang()
  const displayName = profile?.nickname || getClerkDisplayName(clerkUser)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    api.getProfile()
      .then((p) => setProfile(p))
      .catch(() => {})
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (!id || !isLoaded) return
    const activityPromise = initialActivity && initialActivity.id === id
      ? Promise.resolve(initialActivity)
      : api.getActivity(id)

    activityPromise
      .then((a) => {
        setActivity(a)
        setInterestCount(a.interestedCount ?? 0)
        setRegisteredCount(a.registeredCount)

        if (a.status === 'recruiting') {
          setSummaryLoading(true)
          api.getRegistrationSummary(a.id)
            .then(setRegSummary)
            .catch(() => setRegSummary({ total: 0, previews: [] }))
            .finally(() => setSummaryLoading(false))
        }

        if (a.sourceProposalId) {
          api.getActivity(a.sourceProposalId)
            .then((p) => setSourceProposal(p))
            .catch(() => setSourceProposal(null))
        } else {
          setSourceProposal(undefined)
        }

        if (a.status === 'proposed' && a.linkedRecruitIds?.length) {
          api.getActivitiesByIds(a.linkedRecruitIds)
            .then(setLinkedRecruits)
            .catch(() => setLinkedRecruits([]))
        } else {
          setLinkedRecruits([])
        }

        const deviceId = getDeviceId()
        const interestPromise = api.getInterests(a.id)
        const regPromise = a.status === 'recruiting' && isSignedIn
          ? api.getMyRegistration(a.id)
          : Promise.resolve(null)

        return Promise.all([interestPromise, regPromise]).then(([interests, regResult]) => {
          if (isSignedIn && clerkUser?.id) {
            setInterested(interests.some((i) => i.userId === clerkUser.id))
          } else if (deviceId) {
            setInterested(interests.some((i) => i.deviceId === deviceId))
          } else {
            setInterested(false)
          }

          if (regResult?.registration) {
            setMyRegistration(regResult.registration)
            setParticipantCount(regResult.registration.participantCount)
            setNote(regResult.registration.note)
          } else if (!isSignedIn) {
            const guest = getGuestRegistrations().find((g) => g.activityId === a.id)
            if (guest) {
              setMyRegistration({
                id: `guest-${guest.activityId}`,
                activityId: guest.activityId,
                name: guest.name,
                wechat: '',
                participantCount: guest.participantCount,
                note: '',
                registeredAt: guest.registeredAt,
                cancelToken: guest.cancelToken,
              })
              setParticipantCount(guest.participantCount)
              setCancelToken(guest.cancelToken)
            } else {
              setMyRegistration(null)
            }
          } else {
            setMyRegistration(null)
          }
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isLoaded, isSignedIn, clerkUser?.id, initialActivity])

  const toggleInterest = async () => {
    if (!activity || interestLoading) return
    setInterestLoading(true)
    try {
      const res = interested
        ? await api.deleteInterest({ activityId: activity.id })
        : await api.createInterest({ activityId: activity.id })
      const nextCount =
        typeof res.interestedCount === 'number'
          ? res.interestedCount
          : interested
            ? Math.max(0, interestCount - 1)
            : interestCount + 1
      setInterested(!interested)
      setInterestCount(nextCount)
      setActivity((prev) => (prev ? { ...prev, interestedCount: nextCount } : prev))
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setInterestLoading(false)
    }
  }

  const submitRegistration = async (data: {
    name?: string
    wechat?: string
    contactType?: 'wechat' | 'email' | 'other'
    contactValue?: string
    contactLabel?: string
  }) => {
    if (!id || !activity || activity.status !== 'recruiting' || myRegistration) return
    if (!canRegister({ ...activity, registeredCount: activity.registeredCount })) {
      alert(t.registrationClosed)
      return
    }
    const currentCount = activity.registeredCount
    if (activity.maxParticipants != null && currentCount + participantCount > activity.maxParticipants) {
      alert(t.full)
      return
    }

    const optimisticCount = currentCount + participantCount
    setActivity((prev) => (prev ? { ...prev, registeredCount: optimisticCount } : prev))
    setRegisteredCount(optimisticCount)
    setShowRegistrationModal(false)
    setSuccess(true)
    setSubmitting(true)

    try {
      const res = await api.createRegistration({
        activityId: id,
        name: data.name,
        wechat: data.wechat,
        contactType: data.contactType,
        contactValue: data.contactValue,
        contactLabel: data.contactLabel,
        participantCount,
        note: note.trim(),
      })
      setMyRegistration(res.registration ?? null)
      setActivity((prev) =>
        prev ? { ...prev, registeredCount: res.registeredCount } : prev
      )
      setRegisteredCount(res.registeredCount)
      if (res.cancelToken) {
        setCancelToken(res.cancelToken)
        saveGuestRegistration({
          activityId: id,
          cancelToken: res.cancelToken,
          name: data.name ?? displayName,
          participantCount,
          registeredAt: new Date().toISOString(),
        })
      } else {
        addRegistrationId(id)
      }
      notifyActivitiesChanged()
      api.getRegistrationSummary(id)
        .then(setRegSummary)
        .catch(() => {})
    } catch (err) {
      setActivity((prev) => (prev ? { ...prev, registeredCount: currentCount } : prev))
      setRegisteredCount(currentCount)
      setSuccess(false)
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = () => submitRegistration({})

  const handleGuestSubmit = (data: {
    name: string
    wechat?: string
    contactType: 'wechat' | 'email' | 'other'
    contactValue: string
    contactLabel?: string
  }) => {
    submitRegistration(data)
  }

  const handleCancelRegistration = async () => {
    if (!activity || !myRegistration) return
    if (!confirm(t.cancelConfirmQuestion)) return

    if (!isSignedIn && myRegistration.cancelToken) {
      window.location.href = getCancelUrl(myRegistration.cancelToken)
      return
    }

    setCancelLoading(true)
    try {
      const res = isSignedIn && myRegistration.id
        ? await api.cancelRegistrationById(myRegistration.id)
        : await api.cancelRegistration({ activityId: activity.id })
      setMyRegistration(null)
      setSuccess(false)
      setActivity((prev) =>
        prev ? { ...prev, registeredCount: res.registeredCount } : prev
      )
      setRegisteredCount(res.registeredCount)
      removeGuestRegistration(activity.id)
      removeRegistrationId(activity.id)
      notifyActivitiesChanged()
      api.getRegistrationSummary(activity.id)
        .then(setRegSummary)
        .catch(() => {})
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setCancelLoading(false)
    }
  }

  const shell = (content: ReactNode) => (
    <div className="min-h-screen flex flex-col">
      <Header />
      {content}
      <Footer />
    </div>
  )

  if (loading) {
    return shell(<div className="text-center text-gray-400 py-16 flex-1">{t.loading}</div>)
  }

  if (notFound || !activity) {
    return shell(
      <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center page-enter w-full">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">{t.eventNotFound}</h2>
        <Link href="/" className="btn-primary inline-block mt-4">{t.backToHome}</Link>
      </main>,
    )
  }

  if (success && activity) {
    const cancelUrl = cancelToken ? getCancelUrl(cancelToken) : null
    const organizerHint = formatOrganizerContactHint(resolveOrganizerContact(activity))
    const calendarEvent = buildActivityCalendarEvent(activity)
    return shell(
      <main className="flex-1 max-w-lg mx-auto px-4 py-16 page-enter w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">{t.submitRegistration}！</h2>
          <p className="text-gray-600">{t.registerTitle(activity.title)}</p>
          <p className="text-sm text-gray-500 mt-2">{t.participantCount}：{participantCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-2">
          <p className="font-medium text-green-800">📱</p>
          <p>{organizerHint.message}</p>
        </div>

        {organizerHint.copyText && (
          <button
            type="button"
            className="btn-primary w-full mb-6"
            onClick={() => navigator.clipboard.writeText(organizerHint.copyText!)}
          >
            {organizerHint.copyLabel ?? t.copyLink}
          </button>
        )}

        {!isSignedIn && cancelUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-yellow-900 mb-2">⚠️ {t.guestRegistrationHint}</p>
            <p className="text-sm break-all font-mono text-yellow-800 mb-3">{cancelUrl}</p>
            <button
              type="button"
              className="btn-secondary w-full text-sm"
              onClick={() => navigator.clipboard.writeText(cancelUrl)}
            >
              {t.copyLink}
            </button>
          </div>
        )}

        {calendarEvent && (
          <div className="mt-4 pt-4 border-t border-gray-100 mb-6">
            <p className="text-sm text-gray-500 mb-2">{t.addToCalendar}</p>
            <AddToCalendarButton
              uid={calendarEvent.uid}
              title={calendarEvent.title}
              startTime={calendarEvent.startTime}
              endTime={calendarEvent.endTime}
              description={calendarEvent.description}
              alarmMinutesBefore={calendarEvent.alarmMinutesBefore}
              label={calendarEvent.label}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isSignedIn ? (
            <Link href="/my" className="btn-secondary block text-center">{t.myRegistrationsSection}</Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button type="button" className="btn-secondary w-full">{t.signInButton}</button>
              </SignInButton>
              <Link href="/" className="text-sm text-center text-gray-500 hover:text-green-600">{t.backToHome}</Link>
            </>
          )}
        </div>
      </main>,
    )
  }

  const displayCount = activity.registeredCount ?? registeredCount
  const registrationOpen = canRegister({ ...activity, registeredCount: displayCount })
  const inProgress = isInProgress(activity)
  const proposalExpired = activity.status === 'proposed' && isProposalExpired(activity)
  const registerButtonLabel = (() => {
    if (myRegistration) return t.alreadyRegistered
    if (!registrationOpen) {
      const badge = getActivityBadge({ ...activity, registeredCount: displayCount })
      if (badge === 'full') return t.full
      return t.registrationClosed
    }
    return t.registerButton
  })()
  const endedSuccess = isEndedSuccess(activity.status)
  const endedCancelled = isEndedCancelled(activity.status)

  const notes = activity.notes ? activity.notes.split('\n').filter(Boolean) : []

  if (isInfoPost(activity)) {
    return shell(
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <OrganizerEditBar
          activity={activity}
          onUpdated={(updated) => setActivity((prev) => (prev ? { ...prev, ...updated } : prev))}
        />
        <InfoEventSection activity={activity} />
      </main>,
    )
  }

  if (endedCancelled) {
    const cancelContact = formatOrganizerContactHint(resolveOrganizerContact(activity))
    return shell(
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-red-900">
          <p className="font-bold text-lg mb-3">{t.typeCancelled}</p>
          <p className="text-sm mb-1">{t.cancelReason(getCancelReasonLabel(activity.cancelReason))}</p>
          {activity.cancelNote && (
            <p className="text-sm whitespace-pre-wrap break-words mb-4 opacity-90">{activity.cancelNote}</p>
          )}
          <p className="font-medium mb-3">{cancelContact.message}</p>
          {cancelContact.copyText && (
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => navigator.clipboard.writeText(cancelContact.copyText!)}
            >
              {cancelContact.copyLabel ?? t.copyLink}
            </button>
          )}
        </div>
        <div className="opacity-60 pointer-events-none select-none">
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
            {getCategoryEmoji(activity.category)} {getCatLabel(t, activity.category)}
          </span>
          <h1 className="text-2xl font-bold mb-4">{activity.title}</h1>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>📅 {formatEventDate(activity.date, lang)}</p>
            <p>📍 {activity.location || t.locationTbd}</p>
          </div>
          {activity.description && (
            <p className="text-gray-700 whitespace-pre-wrap break-words mb-6">{activity.description}</p>
          )}
        </div>
        <Link href="/" className="btn-primary block text-center w-full mt-6">{t.backToHome}</Link>
      </main>,
    )
  }

  const activityTags = getActivityTags({ ...activity, registeredCount: displayCount })
  const multiDay = isMultiDay(activity)

  return shell(
    <>
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block">
            {getCategoryEmoji(activity.category)} {getCatLabel(t, activity.category)}
          </span>
          <ActivityBadge activity={{ ...activity, registeredCount: displayCount }} />
          {activityTags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium ${
                tag === 'multi_day'
                  ? 'bg-blue-50 text-blue-700'
                  : tag === 'starting_soon'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>
        <OrganizerEditBar
          activity={activity}
          onUpdated={(updated) => setActivity((prev) => (prev ? { ...prev, ...updated } : prev))}
        />
        <h1 className="text-2xl font-bold mb-4">{activity.title}</h1>

        {inProgress && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-xl p-3 mb-4">
            🔵 {t.badge_in_progress}
          </div>
        )}

        {activity.status === 'proposed' && !proposalExpired && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-xl p-3 mb-4">
            💡 {t.sectionProposalsSubtitle}
          </div>
        )}

        {proposalExpired && (
          <div className="bg-amber-50 text-amber-800 text-sm rounded-xl p-3 mb-4">
            ⚠️ 该提议信息可能已过期，仅供参考。如需更新请联系提议人或管理员。
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>📅 {multiDay
            ? formatEventDateRange(activity.date, activity.dateEnd ?? null, lang)
            : formatEventDate(activity.date, lang)
          }</p>
          <p>📍 {t.eventLocation}：{activity.location || t.locationTbd}</p>
          {activity.meetingLocation && (
            <p>🚉 {activity.meetingLocation}{activity.meetingTime ? ` ${activity.meetingTime}` : ''}</p>
          )}
          {activity.status === 'recruiting' && (
            <div>
              <p className="mb-1">👥 {t.registeredCount(displayCount, activity.maxParticipants ?? null)}</p>
              <CapacityBar current={displayCount} max={activity.maxParticipants} />
              <RegistrationPreview
                total={regSummary.total}
                previews={regSummary.previews}
                loading={summaryLoading}
              />
            </div>
          )}
          {activity.status === 'proposed' && (
            <p>💡 {t.interestedCount(interestCount)}</p>
          )}
          {activity.status === 'proposed' && linkedRecruits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-100">
              <p className="text-sm font-medium text-green-800 mb-2">🟢 {t.linkedRecruits}：</p>
              <ul className="space-y-2">
                {linkedRecruits.map((r) => (
                  <li key={r.id} className="text-sm">
                    · {r.title}{' '}
                    <span className="text-gray-500">
                      {formatEventDate(r.date, lang).replace(/ .*/, '')}{' '}
                      {r.registeredCount}{r.maxParticipants ? `/${r.maxParticipants}` : ''}
                    </span>{' '}
                    <Link href={`/event/${r.id}`} className="text-green-600 underline">
                      {t.registerButton} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activity.fee && <p>💰 {activity.fee}</p>}
          {activity.sourceUrl && (
            <a href={activity.sourceUrl} target="_blank" rel="noreferrer" className="text-green-600 underline block truncate">
              🔗 {t.fieldSourceUrl}
            </a>
          )}
        </div>

        {activity.status === 'recruiting' && activity.location && (
          <div className="mb-6">
            <WeatherWidget activityId={activity.id} />
          </div>
        )}

        {activity.description && (
          <div className="mb-6">
            <p className={`text-gray-700 whitespace-pre-wrap break-words ${expanded ? '' : 'line-clamp-4'}`}>
              {activity.description}
            </p>
            {activity.description.length > 120 && (
              <button type="button" className="text-green-600 text-sm mt-1" onClick={() => setExpanded(!expanded)}>
                {expanded ? `${t.showLess} ▴` : `${t.showMore} ▾`}
              </button>
            )}
          </div>
        )}

        {activity.itinerary && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <ItineraryBlock itinerary={activity.itinerary} />
          </div>
        )}

        {notes.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <p className="font-medium text-amber-800 mb-2">⚠️ {t.eventNotes}</p>
            <ul className="text-sm text-amber-700 space-y-1">
              {notes.map((n) => <li key={n}>· {n}</li>)}
            </ul>
          </div>
        )}

        {endedSuccess && activity.recap && (
          <div className="bg-purple-50 rounded-xl p-4 mb-8">
            <p className="font-medium text-purple-800 mb-2">📝 {t.sectionPast}</p>
            <p className="text-sm text-purple-900 whitespace-pre-wrap break-words">{activity.recap}</p>
            {activity.recapImages && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {activity.recapImages.split('\n').filter(Boolean).map((url) => (
                  <img key={url} src={url.trim()} alt="" className="h-24 w-24 object-cover rounded-lg shrink-0" />
                ))}
              </div>
            )}
          </div>
        )}

        {activity.status === 'recruiting' && activity.sourceProposalId && sourceProposal !== undefined && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-xl p-3 mb-4">
            {sourceProposal ? (
              <>
                💡 本次活动来源于提议「{sourceProposal.title}」{' '}
                <Link href={`/event/${sourceProposal.id}`} className="text-green-700 underline">
                  查看原提议
                </Link>
              </>
            ) : (
              '💡 本次活动来源于一个已删除的提议'
            )}
          </div>
        )}

        {endedSuccess ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            {t.typeEnded}
          </div>
        ) : !registrationOpen && activity.status === 'recruiting' && !myRegistration ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500 font-medium">
            {registerButtonLabel}
          </div>
        ) : activity.status === 'proposed' ? (
          <div className="space-y-4">
            <button
              type="button"
              className={`w-full rounded-xl py-3 font-medium border transition-colors ${
                interested
                  ? 'border-gray-300 bg-gray-100 text-gray-600'
                  : 'btn-primary'
              }`}
              onClick={toggleInterest}
              disabled={interestLoading || proposalExpired}
            >
              {interestLoading ? '...' : proposalExpired ? t.badge_proposal_expired : interested ? `❤️ ${t.notInterested}` : `❤️ ${t.interested}`}
            </button>
            {!proposalExpired && (
              isSignedIn ? (
                <Link
                  href={`/recruit/new?from=${activity.id}`}
                  className="btn-secondary block text-center w-full py-3"
                >
                  {t.proposeToRecruit} →
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button type="button" className="btn-secondary w-full py-3">
                    {t.proposeToRecruit} →
                  </button>
                </SignInButton>
              )
            )}
            <Link href="/" className="btn-secondary block text-center">{t.backToHome}</Link>
          </div>
        ) : activity.status !== 'recruiting' ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            {t.registrationClosed}
          </div>
        ) : myRegistration ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p>{myRegistration.name}</p>
              <p>{t.yourRegistration(myRegistration.participantCount)}</p>
              {myRegistration.note && <p>{myRegistration.note}</p>}
            </div>
            <button
              type="button"
              className="w-full rounded-xl py-3 font-medium border border-gray-200 bg-gray-100 text-gray-500 cursor-default"
              disabled
            >
              {t.alreadyRegistered}
            </button>
            <button
              type="button"
              className="w-full rounded-xl py-3 font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              onClick={handleCancelRegistration}
              disabled={cancelLoading}
            >
              {cancelLoading ? t.processing : t.cancelRegistration}
            </button>
          </div>
        ) : !isSignedIn ? (
          <div className="space-y-4">
            <button
              type="button"
              className="btn-primary w-full text-lg"
              onClick={() => setShowRegistrationModal(true)}
              disabled={!registrationOpen}
            >
              {registerButtonLabel}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span>{t.registerButton}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700">
                <p>{t.registerAs(displayName)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.participantCount}</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 text-lg flex items-center justify-center"
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{participantCount}</span>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 text-lg flex items-center justify-center"
                    onClick={() => setParticipantCount(participantCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.noteLabel}</label>
                <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} />
              </div>
            </div>

            <div className="sticky bottom-0 bg-warm-bg pt-3 pb-safe -mx-4 px-4">
              <button type="button" className="btn-primary w-full text-lg" onClick={handleSubmit} disabled={submitting || !registrationOpen}>
                {submitting ? t.submitting : t.submitRegistration}
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>{t.eventOrganizer}：{activity.organizerName}</p>
          {activity.status === 'recruiting' && (
            <p>{formatOrganizerContactHint(resolveOrganizerContact(activity)).message}</p>
          )}
        </div>
      </main>

      <RegistrationModal
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        activityTitle={activity.title}
        participantCount={participantCount}
        note={note}
        onParticipantCountChange={setParticipantCount}
        onNoteChange={setNote}
        onSubmit={handleGuestSubmit}
        submitting={submitting}
      />
    </>,
  )
}
