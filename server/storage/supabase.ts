import { nanoid } from 'nanoid'
import type {
  Activity,
  EnvConfig,
  Interest,
  Notification,
  Profile,
  ProfileNotificationPreference,
  Registration,
} from '@/shared/types'
import { withProfileDefaults } from '@/shared/profileDefaults'
import { getSupabaseClient } from '@/lib/supabase'
import type { GetNotificationsOptions, InterestMutationResult, RegistrationMutationResult, StorageAdapter } from './types'

type ActivityRow = Record<string, unknown>
type RegistrationRow = Record<string, unknown>
type InterestRow = Record<string, unknown>
type ProfileRow = Record<string, unknown>
type NotificationRow = Record<string, unknown>

const PREF_COLUMN: Record<ProfileNotificationPreference, string> = {
  notifyRegistrationChange: 'notify_registration_change',
  notifyActivityReminder: 'notify_activity_reminder',
  notifyProposalRecruiting: 'notify_proposal_recruiting',
  notifyNewRecruit: 'notify_new_recruit',
  notifyInfoReminder: 'notify_info_reminder',
}

export class SupabaseAdapter implements StorageAdapter {
  private env?: EnvConfig

  constructor(env?: EnvConfig) {
    this.env = env
  }

  private get db() {
    return getSupabaseClient(this.env)
  }

  async getActivities(): Promise<Activity[]> {
    const { data, error } = await this.db
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => this.mapActivity(row as ActivityRow))
  }

  async getActivity(id: string): Promise<Activity | null> {
    const { data, error } = await this.db.from('activities').select('*').eq('id', id).single()
    if (error) return null
    return this.mapActivity(data as ActivityRow)
  }

  async getActivitiesByIds(ids: string[]): Promise<Activity[]> {
    if (ids.length === 0) return []
    const { data, error } = await this.db.from('activities').select('*').in('id', ids)
    if (error) throw error
    return (data ?? []).map((row) => this.mapActivity(row as ActivityRow))
  }

  async createActivity(input: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const id = nanoid(8)
    const { data, error } = await this.db
      .from('activities')
      .insert({ id, ...this.unmapActivity(input) })
      .select()
      .single()
    if (error) throw error
    return this.mapActivity(data as ActivityRow)
  }

  async updateActivity(id: string, input: Partial<Activity>): Promise<Activity> {
    const { data, error } = await this.db
      .from('activities')
      .update(this.unmapActivity(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return this.mapActivity(data as ActivityRow)
  }

  async deleteActivity(id: string): Promise<void> {
    const { error } = await this.db.from('activities').delete().eq('id', id)
    if (error) throw error
  }

  async addLinkedRecruit(proposalId: string, recruitId: string): Promise<void> {
    const proposal = await this.getActivity(proposalId)
    if (!proposal) return
    const existing = proposal.linkedRecruitIds ?? []
    if (existing.includes(recruitId)) return
    await this.updateActivity(proposalId, { linkedRecruitIds: [...existing, recruitId] })
  }

  async getRegistrations(activityId: string): Promise<Registration[]> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .order('registered_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => this.mapRegistration(row as RegistrationRow))
  }

  async getActiveRegistrations(activityId: string): Promise<Registration[]> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .is('cancelled_at', null)
      .order('registered_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => this.mapRegistration(row as RegistrationRow))
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error || !data) return null
    return this.mapRegistration(data as RegistrationRow)
  }

  async getRegistrationByToken(token: string): Promise<Registration | null> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('cancel_token', token)
      .maybeSingle()
    if (error || !data) return null
    return this.mapRegistration(data as RegistrationRow)
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .order('registered_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => this.mapRegistration(row as RegistrationRow))
  }

  async findRegistration(activityId: string, wechat: string): Promise<Registration | null> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .eq('wechat', wechat)
      .is('cancelled_at', null)
      .maybeSingle()
    if (error || !data) return null
    return this.mapRegistration(data as RegistrationRow)
  }

  async findRegistrationByNameAndWechat(
    activityId: string,
    name: string,
    wechat: string,
  ): Promise<Registration | null> {
    const { data, error } = await this.db
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .eq('wechat', wechat.trim())
      .eq('name', name.trim())
      .is('cancelled_at', null)
      .maybeSingle()
    if (error || !data) return null
    return this.mapRegistration(data as RegistrationRow)
  }

  async createRegistration(input: Omit<Registration, 'id' | 'registeredAt'> & { registeredAt?: string }): Promise<Registration> {
    const id = nanoid(8)
    const row = this.unmapRegistration(input)
    if (input.registeredAt) row.registered_at = input.registeredAt
    const { data, error } = await this.db
      .from('registrations')
      .insert({ id, ...row })
      .select()
      .single()
    if (error) throw error
    return this.mapRegistration(data as RegistrationRow)
  }

  async cancelRegistration(id: string, cancelledBy: 'user' | 'admin'): Promise<RegistrationMutationResult> {
    const existing = await this.getRegistrationById(id)
    if (!existing) {
      return { registration: undefined, registeredCount: 0 }
    }
    if (existing.cancelledAt) {
      const registeredCount = await this.countActiveRegistrations(existing.activityId)
      return { registration: existing, registeredCount }
    }
    const { data, error } = await this.db
      .from('registrations')
      .update({
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const registration = this.mapRegistration(data as RegistrationRow)
    const registeredCount = await this.countActiveRegistrations(existing.activityId)
    return { registration, registeredCount }
  }

  async deleteRegistration(activityId: string, wechat: string): Promise<RegistrationMutationResult> {
    const existing = await this.findRegistration(activityId, wechat)
    const { error } = await this.db
      .from('registrations')
      .delete()
      .eq('activity_id', activityId)
      .eq('wechat', wechat)
    if (error) throw error
    const registeredCount = await this.countRegistrations(activityId)
    return { registration: existing ?? undefined, registeredCount }
  }

  async getInterests(activityId: string): Promise<Interest[]> {
    const { data, error } = await this.db.from('interests').select('*').eq('activity_id', activityId)
    if (error) throw error
    return (data ?? []).map((row) => this.mapInterest(row as InterestRow))
  }

  async findInterest(activityId: string, wechat: string): Promise<Interest | null> {
    const { data, error } = await this.db
      .from('interests')
      .select('*')
      .eq('activity_id', activityId)
      .eq('wechat', wechat)
      .maybeSingle()
    if (error || !data) return null
    return this.mapInterest(data as InterestRow)
  }

  async findInterestByUserId(activityId: string, userId: string): Promise<Interest | null> {
    const { data, error } = await this.db
      .from('interests')
      .select('*')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return this.mapInterest(data as InterestRow)
  }

  async findInterestByDeviceId(activityId: string, deviceId: string): Promise<Interest | null> {
    const { data, error } = await this.db
      .from('interests')
      .select('*')
      .eq('activity_id', activityId)
      .eq('device_id', deviceId)
      .maybeSingle()
    if (error || !data) return null
    return this.mapInterest(data as InterestRow)
  }

  async createInterest(input: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> {
    const id = nanoid(8)
    const { data, error } = await this.db
      .from('interests')
      .insert({ id, ...this.unmapInterest(input) })
      .select()
      .single()
    if (error) throw error
    const interest = this.mapInterest(data as InterestRow)
    const interestedCount = await this.syncInterestedCount(input.activityId)
    return { interest, interestedCount }
  }

  async deleteInterest(activityId: string, wechat: string): Promise<InterestMutationResult> {
    const existing = await this.findInterest(activityId, wechat)
    const { error } = await this.db
      .from('interests')
      .delete()
      .eq('activity_id', activityId)
      .eq('wechat', wechat)
    if (error) throw error
    const interestedCount = await this.syncInterestedCount(activityId)
    return { interest: existing ?? undefined, interestedCount }
  }

  async deleteInterestByUserId(activityId: string, userId: string): Promise<InterestMutationResult> {
    const existing = await this.findInterestByUserId(activityId, userId)
    const { error } = await this.db
      .from('interests')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId)
    if (error) throw error
    const interestedCount = await this.syncInterestedCount(activityId)
    return { interest: existing ?? undefined, interestedCount }
  }

  async deleteInterestByDeviceId(activityId: string, deviceId: string): Promise<InterestMutationResult> {
    const existing = await this.findInterestByDeviceId(activityId, deviceId)
    const { error } = await this.db
      .from('interests')
      .delete()
      .eq('activity_id', activityId)
      .eq('device_id', deviceId)
    if (error) throw error
    const interestedCount = await this.syncInterestedCount(activityId)
    return { interest: existing ?? undefined, interestedCount }
  }

  private async countActiveRegistrations(activityId: string): Promise<number> {
    const registrations = await this.getActiveRegistrations(activityId)
    return registrations.reduce((sum, r) => sum + r.participantCount, 0)
  }

  private async countRegistrations(activityId: string): Promise<number> {
    return this.countActiveRegistrations(activityId)
  }

  private async syncInterestedCount(activityId: string): Promise<number> {
    const { count, error } = await this.db
      .from('interests')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activityId)
    if (error) throw error
    const interestedCount = count ?? 0
    await this.updateActivity(activityId, { interestedCount })
    return interestedCount
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.db.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    if (!data) return null
    return this.mapProfile(data as ProfileRow)
  }

  async upsertProfile(data: Partial<Profile> & { id: string; nickname?: string }): Promise<Profile> {
    const { data: row, error } = await this.db
      .from('profiles')
      .upsert(this.unmapProfile(data))
      .select()
      .single()
    if (error) throw error
    return this.mapProfile(row as ProfileRow)
  }

  async listProfilesWithPreference(pref: ProfileNotificationPreference): Promise<Profile[]> {
    const column = PREF_COLUMN[pref]
    const { data, error } = await this.db.from('profiles').select('*').eq(column, true)
    if (error) throw error
    return (data ?? []).map((row) => this.mapProfile(row as ProfileRow))
  }

  async getNotifications(userId: string, options: GetNotificationsOptions = {}): Promise<Notification[]> {
    const limit = options.limit ?? 50
    let query = this.db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (options.unreadOnly) {
      query = query.eq('is_read', false)
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => this.mapNotification(row as NotificationRow))
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
  }

  async createNotification(
    data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>,
  ): Promise<Notification> {
    const id = nanoid(8)
    const { data: row, error } = await this.db
      .from('notifications')
      .insert({
        id,
        user_id: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        action_url: data.actionUrl ?? null,
        activity_id: data.activityId ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return this.mapNotification(row as NotificationRow)
  }

  private mapProfile(row: ProfileRow): Profile {
    return withProfileDefaults({
      id: String(row.id),
      nickname: String(row.nickname),
      wechat: row.wechat ? String(row.wechat) : undefined,
      email: row.email ? String(row.email) : undefined,
      notificationEmail: row.notification_email ? String(row.notification_email) : undefined,
      notifyRegistrationChange: row.notify_registration_change !== false,
      notifyActivityReminder: row.notify_activity_reminder !== false,
      notifyProposalRecruiting: row.notify_proposal_recruiting !== false,
      notifyNewRecruit: row.notify_new_recruit === true,
      notifyInfoReminder: row.notify_info_reminder !== false,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    })
  }

  private unmapProfile(profile: Partial<Profile> & { id: string; nickname?: string }): Record<string, unknown> {
    const result: Record<string, unknown> = { id: profile.id }
    if (profile.nickname !== undefined) result.nickname = profile.nickname
    if (profile.wechat !== undefined) result.wechat = profile.wechat || null
    if (profile.email !== undefined) result.email = profile.email || null
    if (profile.notificationEmail !== undefined) result.notification_email = profile.notificationEmail || null
    if (profile.notifyRegistrationChange !== undefined) {
      result.notify_registration_change = profile.notifyRegistrationChange
    }
    if (profile.notifyActivityReminder !== undefined) {
      result.notify_activity_reminder = profile.notifyActivityReminder
    }
    if (profile.notifyProposalRecruiting !== undefined) {
      result.notify_proposal_recruiting = profile.notifyProposalRecruiting
    }
    if (profile.notifyNewRecruit !== undefined) result.notify_new_recruit = profile.notifyNewRecruit
    if (profile.notifyInfoReminder !== undefined) result.notify_info_reminder = profile.notifyInfoReminder
    return result
  }

  private mapNotification(row: NotificationRow): Notification {
    return {
      id: String(row.id),
      userId: String(row.user_id),
      type: row.type as Notification['type'],
      title: String(row.title),
      body: String(row.body),
      actionUrl: row.action_url ? String(row.action_url) : undefined,
      activityId: row.activity_id ? String(row.activity_id) : undefined,
      isRead: Boolean(row.is_read),
      createdAt: String(row.created_at),
    }
  }

  private mapActivity(row: ActivityRow): Activity {
    return {
      id: String(row.id),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      date: row.date ? String(row.date) : null,
      dateEnd: row.date_end ? String(row.date_end) : undefined,
      registrationDeadline: row.registration_deadline ? String(row.registration_deadline) : undefined,
      location: String(row.location ?? ''),
      minParticipants: row.min_participants != null ? Number(row.min_participants) : undefined,
      maxParticipants: row.max_participants != null ? Number(row.max_participants) : null,
      fee: String(row.fee ?? ''),
      feeLevel: row.fee_level as Activity['feeLevel'],
      notes: String(row.notes ?? ''),
      organizerName: String(row.organizer_name ?? ''),
      organizerWechat: String(row.organizer_wechat ?? ''),
      organizerContactType: row.organizer_contact_type as Activity['organizerContactType'],
      organizerContact: row.organizer_contact ? String(row.organizer_contact) : undefined,
      organizerContactLabel: row.organizer_contact_label ? String(row.organizer_contact_label) : undefined,
      meetingLocation: row.meeting_location ? String(row.meeting_location) : undefined,
      meetingTime: row.meeting_time ? String(row.meeting_time) : undefined,
      postType: (row.post_type as Activity['postType']) ?? 'activity',
      infoStartTime: row.info_start_time ? String(row.info_start_time) : undefined,
      infoDeadline: row.info_deadline ? String(row.info_deadline) : undefined,
      infoPrice: row.info_price ? String(row.info_price) : undefined,
      infoActionLabel: row.info_action_label ? String(row.info_action_label) : undefined,
      infoActionUrl: row.info_action_url ? String(row.info_action_url) : undefined,
      organizerId: row.organizer_id ? String(row.organizer_id) : undefined,
      sourceUrl: String(row.source_url ?? ''),
      status: row.status as Activity['status'],
      category: row.category as Activity['category'],
      interestedCount: Number(row.interested_count ?? 0),
      sourceProposalId: row.source_proposal_id ? String(row.source_proposal_id) : undefined,
      linkedRecruitIds: (row.linked_recruit_ids as string[]) ?? [],
      endedAt: row.ended_at ? String(row.ended_at) : undefined,
      recap: row.recap ? String(row.recap) : undefined,
      recapImages: row.recap_images ? String(row.recap_images) : undefined,
      cancelReason: row.cancel_reason as Activity['cancelReason'],
      cancelNote: row.cancel_note ? String(row.cancel_note) : undefined,
      ticketPrices: row.ticket_prices ? String(row.ticket_prices) : undefined,
      ticketUrl: row.ticket_url ? String(row.ticket_url) : undefined,
      ticketDeadline: row.ticket_deadline ? String(row.ticket_deadline) : undefined,
      ticketMethod: row.ticket_method as Activity['ticketMethod'],
      refundPolicy: row.refund_policy ? String(row.refund_policy) : undefined,
      difficulty: row.difficulty as Activity['difficulty'],
      distanceAndDuration: row.distance_duration ? String(row.distance_duration) : undefined,
      itinerary: row.itinerary ? String(row.itinerary) : undefined,
      equipment: row.equipment ? String(row.equipment) : undefined,
      transportation: row.transportation ? String(row.transportation) : undefined,
      mealArrangement: row.meal_arrangement as Activity['mealArrangement'],
      restaurantAddress: row.restaurant_address ? String(row.restaurant_address) : undefined,
      perPersonCost: row.per_person_cost ? String(row.per_person_cost) : undefined,
      reservationMethod: row.reservation_method as Activity['reservationMethod'],
      requiresDeposit: Boolean(row.requires_deposit),
      createdAt: String(row.created_at),
    }
  }

  private unmapActivity(activity: Partial<Activity>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (activity.title !== undefined) result.title = activity.title
    if (activity.description !== undefined) result.description = activity.description
    if (activity.date !== undefined) result.date = activity.date
    if (activity.dateEnd !== undefined) result.date_end = activity.dateEnd
    if (activity.registrationDeadline !== undefined) result.registration_deadline = activity.registrationDeadline
    if (activity.location !== undefined) result.location = activity.location
    if (activity.minParticipants !== undefined) result.min_participants = activity.minParticipants
    if (activity.maxParticipants !== undefined) result.max_participants = activity.maxParticipants
    if (activity.fee !== undefined) result.fee = activity.fee
    if (activity.feeLevel !== undefined) result.fee_level = activity.feeLevel
    if (activity.notes !== undefined) result.notes = activity.notes
    if (activity.organizerName !== undefined) result.organizer_name = activity.organizerName
    if (activity.organizerWechat !== undefined) result.organizer_wechat = activity.organizerWechat
    if (activity.organizerContactType !== undefined) result.organizer_contact_type = activity.organizerContactType
    if (activity.organizerContact !== undefined) result.organizer_contact = activity.organizerContact
    if (activity.organizerContactLabel !== undefined) result.organizer_contact_label = activity.organizerContactLabel
    if (activity.meetingLocation !== undefined) result.meeting_location = activity.meetingLocation
    if (activity.meetingTime !== undefined) result.meeting_time = activity.meetingTime
    if (activity.postType !== undefined) result.post_type = activity.postType
    if (activity.infoStartTime !== undefined) result.info_start_time = activity.infoStartTime
    if (activity.infoDeadline !== undefined) result.info_deadline = activity.infoDeadline
    if (activity.infoPrice !== undefined) result.info_price = activity.infoPrice
    if (activity.infoActionLabel !== undefined) result.info_action_label = activity.infoActionLabel
    if (activity.infoActionUrl !== undefined) result.info_action_url = activity.infoActionUrl
    if (activity.organizerId !== undefined) result.organizer_id = activity.organizerId
    if (activity.sourceUrl !== undefined) result.source_url = activity.sourceUrl
    if (activity.status !== undefined) result.status = activity.status
    if (activity.category !== undefined) result.category = activity.category
    if (activity.interestedCount !== undefined) result.interested_count = activity.interestedCount
    if (activity.sourceProposalId !== undefined) result.source_proposal_id = activity.sourceProposalId
    if (activity.linkedRecruitIds !== undefined) result.linked_recruit_ids = activity.linkedRecruitIds
    if (activity.endedAt !== undefined) result.ended_at = activity.endedAt
    if (activity.recap !== undefined) result.recap = activity.recap
    if (activity.recapImages !== undefined) result.recap_images = activity.recapImages
    if (activity.cancelReason !== undefined) result.cancel_reason = activity.cancelReason
    if (activity.cancelNote !== undefined) result.cancel_note = activity.cancelNote
    if (activity.ticketPrices !== undefined) result.ticket_prices = activity.ticketPrices
    if (activity.ticketUrl !== undefined) result.ticket_url = activity.ticketUrl
    if (activity.ticketDeadline !== undefined) result.ticket_deadline = activity.ticketDeadline
    if (activity.ticketMethod !== undefined) result.ticket_method = activity.ticketMethod
    if (activity.refundPolicy !== undefined) result.refund_policy = activity.refundPolicy
    if (activity.difficulty !== undefined) result.difficulty = activity.difficulty
    if (activity.distanceAndDuration !== undefined) result.distance_duration = activity.distanceAndDuration
    if (activity.itinerary !== undefined) result.itinerary = activity.itinerary
    if (activity.equipment !== undefined) result.equipment = activity.equipment
    if (activity.transportation !== undefined) result.transportation = activity.transportation
    if (activity.mealArrangement !== undefined) result.meal_arrangement = activity.mealArrangement
    if (activity.restaurantAddress !== undefined) result.restaurant_address = activity.restaurantAddress
    if (activity.perPersonCost !== undefined) result.per_person_cost = activity.perPersonCost
    if (activity.reservationMethod !== undefined) result.reservation_method = activity.reservationMethod
    if (activity.requiresDeposit !== undefined) result.requires_deposit = activity.requiresDeposit
    return result
  }

  private mapRegistration(row: RegistrationRow): Registration {
    return {
      id: String(row.id),
      activityId: String(row.activity_id),
      userId: row.user_id ? String(row.user_id) : undefined,
      name: String(row.name),
      wechat: String(row.wechat),
      contactType: (row.contact_type as Registration['contactType']) ?? 'wechat',
      contactValue: row.contact_value != null ? String(row.contact_value) : String(row.wechat ?? ''),
      contactLabel: row.contact_label ? String(row.contact_label) : undefined,
      participantCount: Number(row.participant_count ?? 1),
      note: String(row.note ?? ''),
      registeredAt: String(row.registered_at),
      cancelToken: row.cancel_token ? String(row.cancel_token) : undefined,
      cancelledAt: row.cancelled_at ? String(row.cancelled_at) : undefined,
      cancelledBy: row.cancelled_by as Registration['cancelledBy'],
    }
  }

  private unmapRegistration(r: Partial<Registration>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (r.activityId !== undefined) result.activity_id = r.activityId
    if (r.userId !== undefined) result.user_id = r.userId
    if (r.name !== undefined) result.name = r.name
    if (r.wechat !== undefined) result.wechat = r.wechat
    if (r.contactType !== undefined) result.contact_type = r.contactType
    if (r.contactValue !== undefined) result.contact_value = r.contactValue
    if (r.contactLabel !== undefined) result.contact_label = r.contactLabel
    if (r.participantCount !== undefined) result.participant_count = r.participantCount
    if (r.note !== undefined) result.note = r.note
    if (r.cancelToken !== undefined) result.cancel_token = r.cancelToken
    return result
  }

  private mapInterest(row: InterestRow): Interest {
    return {
      id: String(row.id),
      activityId: String(row.activity_id),
      userId: row.user_id ? String(row.user_id) : undefined,
      deviceId: row.device_id ? String(row.device_id) : undefined,
      wechat: row.wechat ? String(row.wechat) : undefined,
      createdAt: String(row.created_at),
    }
  }

  private unmapInterest(i: Partial<Interest>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (i.activityId !== undefined) result.activity_id = i.activityId
    if (i.userId !== undefined) result.user_id = i.userId
    if (i.deviceId !== undefined) result.device_id = i.deviceId
    if (i.wechat !== undefined) result.wechat = i.wechat
    return result
  }
}
