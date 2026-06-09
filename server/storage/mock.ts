import { nanoid } from 'nanoid'
import type {
  Activity,
  InfoInterest,
  Interest,
  Notification,
  Profile,
  ProfileNotificationPreference,
  Registration,
} from '../../shared/types'
import { withProfileDefaults } from '../../shared/profileDefaults'
import type { InterestMutationResult, RegistrationMutationResult, StorageAdapter } from './types'

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()
const futureDate = (days: number, hour = 9) => {
  const d = new Date(now.getTime() + days * 86400000)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const futureHours = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString()

function seedActivities(): Activity[] {
  return [
    {
      id: 'prop001',
      title: 'Le Marais 美食探店',
      description: '周末法式小酒馆巡礼，5家精选餐厅，从传统 bistro 到现代 fusion，适合喜欢美食的朋友一起探索玛黑区。',
      date: null,
      location: 'Le Marais, Paris 4e',
      maxParticipants: null,
      fee: '各付各的，人均约 30-50€',
      notes: '',
      organizerName: 'Cette糖',
      organizerWechat: 'cette456',
      organizerContactType: 'wechat',
      organizerContact: 'cette456',
      postType: 'activity',
      sourceUrl: 'https://www.sortiraparis.com/example',
      status: 'proposed',
      category: 'dining',
      interestedCount: 5,
      createdAt: daysAgo(2),
      feeLevel: 'paid',
    },
    {
      id: 'prop002',
      title: '塞纳河 Picnic 野餐',
      description: '天气好的时候在塞纳河边野餐，自带食物或附近买，聊天晒太阳，轻松社交。',
      date: null,
      location: 'Pont Neuf 附近',
      maxParticipants: null,
      fee: '免费，自备食物',
      notes: '建议带野餐垫',
      organizerName: '小明',
      organizerWechat: 'xiaoming88',
      sourceUrl: '',
      status: 'proposed',
      category: 'dining',
      interestedCount: 3,
      createdAt: daysAgo(5),
      feeLevel: 'free',
    },
    {
      id: 'prop003',
      title: '卢浮宫周五夜场',
      description: '卢浮宫每周五晚延长开放至 21:45，人比白天少，适合慢慢欣赏名画。',
      date: null,
      location: 'Musée du Louvre',
      maxParticipants: null,
      fee: '免费（26岁以下欧盟居民）',
      notes: '需提前预约免费票',
      organizerName: 'Lily',
      organizerWechat: 'lily_art',
      sourceUrl: 'https://www.louvre.fr/',
      status: 'proposed',
      category: 'culture',
      interestedCount: 2,
      createdAt: daysAgo(1),
      feeLevel: 'unknown',
      linkedRecruitIds: ['recr003', 'recr004'],
    },
    {
      id: 'info001',
      title: '卢浮宫夏季音乐会',
      description: '6月16日 15:00 开始抢票，官网直接购买，约39€起。夏季特别演出，值得一看。',
      date: null,
      location: 'Musée du Louvre',
      maxParticipants: null,
      fee: '39€起',
      notes: '',
      organizerName: 'James',
      organizerWechat: '',
      organizerContactType: 'private',
      postType: 'info',
      infoStartTime: futureHours(0.5),
      infoDeadline: futureDate(14, 15),
      infoPrice: '39€起',
      infoActionLabel: '立即抢票',
      infoActionUrl: 'https://www.louvre.fr/',
      sourceUrl: 'https://www.louvre.fr/',
      status: 'proposed',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(0),
    },
    {
      id: 'recr001',
      title: 'Rambouillet 徒步',
      description: '从 Saint-Lazare 坐火车去 Rambouillet 森林徒步，约 12km，中等难度，风景优美。适合有一定体力、喜欢户外的朋友。',
      date: futureDate(10, 9),
      location: 'Forêt de Rambouillet',
      meetingLocation: 'Saint-Lazare 站 B出口',
      meetingTime: '09:00',
      postType: 'activity',
      maxParticipants: 10,
      fee: '火车票自理，约 15€',
      notes: '请穿运动鞋\n自备午餐和水\n雨天取消',
      organizerName: 'James',
      organizerWechat: 'james123',
      organizerContactType: 'wechat',
      organizerContact: 'james123',
      sourceUrl: '',
      status: 'recruiting',
      category: 'sports',
      interestedCount: 0,
      createdAt: daysAgo(7),
      difficulty: 'medium',
      distanceAndDuration: '约 12km，4-5 小时',
      itinerary: 'Saint-Lazare 9:00 集合 → 火车 → 森林徒步 → 16:00 返程',
      equipment: '运动鞋、背包、防晒',
      transportation: 'RER / 火车，约 15€ 往返',
      mealArrangement: 'self',
    },
    {
      id: 'recr002',
      title: '玛黑 Brunch 聚餐',
      description: '周末法式 Brunch，提前订位，适合喜欢美食和轻松社交的朋友。',
      date: futureHours(20),
      location: 'Le Marais, Paris 4e',
      maxParticipants: 8,
      fee: '人均约 25-35€',
      notes: '请准时到达\n素食可提前告知',
      organizerName: 'Amy',
      organizerWechat: '',
      organizerContactType: 'email',
      organizerContact: 'amy@example.com',
      postType: 'activity',
      sourceUrl: '',
      status: 'recruiting',
      category: 'dining',
      interestedCount: 0,
      createdAt: daysAgo(3),
      restaurantAddress: 'Le Marais, Rue des Rosiers 附近',
      perPersonCost: '25-35€',
      reservationMethod: 'organizer',
      requiresDeposit: false,
    },
    {
      id: 'recr003',
      title: '卢浮宫周五夜场',
      description: '卢浮宫每周五晚延长开放，一起慢慢欣赏名画。',
      date: futureDate(7, 18),
      location: 'Musée du Louvre',
      maxParticipants: 10,
      fee: '免费（26岁以下欧盟居民）',
      notes: '需提前预约免费票',
      organizerName: 'Lily',
      organizerWechat: 'lily_art',
      sourceUrl: 'https://www.louvre.fr/',
      status: 'recruiting',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(4),
      sourceProposalId: 'prop003',
    },
    {
      id: 'recr004',
      title: '卢浮宫周五夜场 第二期',
      description: '卢浮宫夜场第二期招募，错过第一期的朋友欢迎加入。',
      date: futureDate(21, 18),
      location: 'Musée du Louvre',
      maxParticipants: 10,
      fee: '免费（26岁以下欧盟居民）',
      notes: '',
      organizerName: 'Lily',
      organizerWechat: 'lily_art',
      sourceUrl: 'https://www.louvre.fr/',
      status: 'recruiting',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(2),
      sourceProposalId: 'prop003',
    },
    {
      id: 'end001',
      title: 'Montmartre 摄影漫步',
      description: '已完成的活动：蒙马特高地街拍，Sacré-Cœur 日落，大家拍了很多好照片！',
      date: daysAgo(14),
      location: 'Abbesses 站',
      maxParticipants: 12,
      fee: '免费',
      notes: '',
      organizerName: 'Tom',
      organizerWechat: 'tom_photo',
      sourceUrl: '',
      status: 'ended_success',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(30),
      endedAt: daysAgo(14),
      recap: '蒙马特高地街拍圆满结束！Sacré-Cœur 日落超美，大家拍了很多好照片，下次再约～',
      recapImages: 'https://picsum.photos/400/300?random=1\nhttps://picsum.photos/400/300?random=2',
    },
    {
      id: 'end002',
      title: 'Versailles 一日游',
      description: '原计划周末去凡尔赛宫，因天气取消。',
      date: daysAgo(7),
      location: 'Versailles',
      maxParticipants: 15,
      fee: '门票约 20€',
      notes: '',
      organizerName: 'James',
      organizerWechat: 'james123',
      sourceUrl: '',
      status: 'ended_cancelled',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(20),
      endedAt: daysAgo(8),
      cancelReason: 'weather',
      cancelNote: '巴黎近期持续降雨，下次天气好了再约！',
    },
  ]
}

function seedRegistrations(): Registration[] {
  return [
    { id: 'reg001', activityId: 'recr001', name: 'James', wechat: 'james123', contactType: 'wechat', contactValue: 'james123', participantCount: 2, note: '有车', registeredAt: daysAgo(6) },
    { id: 'reg002', activityId: 'recr001', name: 'Cette糖', wechat: 'cette456', participantCount: 1, note: '', registeredAt: daysAgo(5) },
    { id: 'reg003', activityId: 'recr001', name: '小明', wechat: 'xiaoming88', participantCount: 2, note: '', registeredAt: daysAgo(4) },
    { id: 'reg004', activityId: 'recr001', name: 'Lily', wechat: 'lily_art', participantCount: 2, note: '素食', registeredAt: daysAgo(3) },
    { id: 'reg005', activityId: 'recr002', name: 'Amy', wechat: 'amy_vintage', participantCount: 1, note: '发起人', registeredAt: daysAgo(2) },
    { id: 'reg006', activityId: 'recr002', name: 'Tom', wechat: 'tom_photo', participantCount: 1, note: '', registeredAt: daysAgo(1) },
    { id: 'reg007', activityId: 'end002', name: 'James', wechat: 'james123', participantCount: 1, note: '', registeredAt: daysAgo(10) },
  ]
}

function seedInterests(): Interest[] {
  return [
    { id: 'int001', activityId: 'prop001', name: 'Alice', wechat: 'alice01', createdAt: daysAgo(2) },
    { id: 'int002', activityId: 'prop001', name: 'Bob', wechat: 'bob02', createdAt: daysAgo(2) },
    { id: 'int003', activityId: 'prop001', name: 'Carol', wechat: 'carol03', createdAt: daysAgo(1) },
    { id: 'int004', activityId: 'prop001', name: 'David', wechat: 'david04', createdAt: daysAgo(1) },
    { id: 'int005', activityId: 'prop001', name: 'Eve', wechat: 'eve05', createdAt: daysAgo(0) },
    { id: 'int006', activityId: 'prop002', name: 'Frank', wechat: 'frank06', createdAt: daysAgo(4) },
    { id: 'int007', activityId: 'prop002', name: 'Grace', wechat: 'grace07', createdAt: daysAgo(3) },
    { id: 'int008', activityId: 'prop002', name: 'Henry', wechat: 'henry08', createdAt: daysAgo(2) },
    { id: 'int009', activityId: 'prop003', userId: 'demo-user', name: 'Ivy', wechat: 'ivy09', createdAt: daysAgo(3) },
    { id: 'int010', activityId: 'prop003', name: 'Jack', wechat: 'jack10', createdAt: daysAgo(2) },
  ]
}

function seedNotificationTemplates(): Omit<Notification, 'id' | 'userId'>[] {
  return [
    {
      type: 'activity_cancelled',
      title: '「Versailles 一日游」已取消',
      body: '原因：天气原因',
      actionUrl: '/event/end002',
      activityId: 'end002',
      isRead: false,
      createdAt: daysAgo(0),
    },
    {
      type: 'proposal_recruiting',
      title: '你感兴趣的活动开始招募了！',
      body: '「卢浮宫周五夜场」6月20日 Musée du Louvre',
      actionUrl: '/event/recr003',
      activityId: 'recr003',
      isRead: false,
      createdAt: daysAgo(1),
    },
    {
      type: 'activity_updated',
      title: '「Rambouillet 徒步」信息有更新',
      body: '集合地点已更新为 Saint-Lazare 站 B出口',
      actionUrl: '/event/recr001',
      activityId: 'recr001',
      isRead: true,
      createdAt: daysAgo(3),
    },
  ]
}

function seedInfoInterests(): InfoInterest[] {
  return [
    {
      id: 'ii001',
      activityId: 'info001',
      email: 'guest@example.com',
      createdAt: daysAgo(1),
    },
  ]
}

export class MockAdapter implements StorageAdapter {
  private activities: Activity[]
  private registrations: Registration[]
  private interests: Interest[]
  private profiles = new Map<string, Profile>()
  private notifications: Notification[] = []
  private infoInterests: InfoInterest[]
  private seededNotificationUsers = new Set<string>()

  constructor() {
    this.activities = seedActivities()
    this.registrations = seedRegistrations()
    this.interests = seedInterests()
    this.infoInterests = seedInfoInterests()
    for (const activity of this.activities) {
      this.syncInterestedCount(activity.id)
    }
  }

  private ensureSeedNotifications(userId: string): void {
    if (this.seededNotificationUsers.has(userId)) return
    this.seededNotificationUsers.add(userId)
    for (const template of seedNotificationTemplates()) {
      this.notifications.push({
        ...template,
        id: nanoid(8),
        userId,
      })
    }
  }

  private syncInterestedCount(activityId: string): number {
    const count = this.interests.filter((i) => i.activityId === activityId).length
    const activity = this.activities.find((a) => a.id === activityId)
    if (activity) activity.interestedCount = count
    return count
  }

  async getActivities(): Promise<Activity[]> {
    return [...this.activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getActivity(id: string): Promise<Activity | null> {
    return this.activities.find((a) => a.id === id) ?? null
  }

  async getActivitiesByIds(ids: string[]): Promise<Activity[]> {
    const unique = [...new Set(ids)]
    return unique
      .map((id) => this.activities.find((a) => a.id === id))
      .filter((a): a is Activity => a != null)
  }

  async addLinkedRecruit(proposalId: string, recruitId: string): Promise<void> {
    const proposal = this.activities.find((a) => a.id === proposalId)
    if (!proposal) throw new Error('Proposal not found')
    const existing = proposal.linkedRecruitIds ?? []
    if (!existing.includes(recruitId)) {
      proposal.linkedRecruitIds = [...existing, recruitId]
    }
  }

  async createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const activity: Activity = {
      ...data,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
    }
    this.activities.push(activity)
    return activity
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const idx = this.activities.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Activity not found')
    this.activities[idx] = { ...this.activities[idx], ...data, id }
    return this.activities[idx]
  }

  async deleteActivity(id: string): Promise<void> {
    this.activities = this.activities.filter((a) => a.id !== id)
    this.registrations = this.registrations.filter((r) => r.activityId !== id)
    this.interests = this.interests.filter((i) => i.activityId !== id)
  }

  async getRegistrations(activityId: string): Promise<Registration[]> {
    return this.registrations
      .filter((r) => r.activityId === activityId)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())
  }

  async getActiveRegistrations(activityId: string): Promise<Registration[]> {
    return this.registrations
      .filter((r) => r.activityId === activityId && !r.cancelledAt)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    return this.registrations.find((r) => r.id === id) ?? null
  }

  async getRegistrationByToken(token: string): Promise<Registration | null> {
    return this.registrations.find((r) => r.cancelToken === token) ?? null
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    return this.registrations
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
  }

  async findRegistration(activityId: string, wechat: string): Promise<Registration | null> {
    return this.registrations.find(
      (r) => r.activityId === activityId && r.wechat === wechat && !r.cancelledAt,
    ) ?? null
  }

  async findRegistrationByNameAndWechat(
    activityId: string,
    name: string,
    wechat: string,
  ): Promise<Registration | null> {
    const n = name.trim().toLowerCase()
    const w = wechat.trim().toLowerCase()
    return this.registrations.find(
      (r) =>
        r.activityId === activityId &&
        !r.cancelledAt &&
        r.name.trim().toLowerCase() === n &&
        r.wechat.trim().toLowerCase() === w,
    ) ?? null
  }

  private countActiveRegistrations(activityId: string): number {
    return this.registrations
      .filter((r) => r.activityId === activityId && !r.cancelledAt)
      .reduce((sum, r) => sum + r.participantCount, 0)
  }

  private countRegistrations(activityId: string): number {
    return this.countActiveRegistrations(activityId)
  }

  async createRegistration(data: Omit<Registration, 'id' | 'registeredAt'> & { registeredAt?: string }): Promise<Registration> {
    const registration: Registration = {
      ...data,
      id: nanoid(8),
      registeredAt: data.registeredAt ?? new Date().toISOString(),
    }
    this.registrations.push(registration)
    return registration
  }

  async cancelRegistration(id: string, cancelledBy: 'user' | 'admin'): Promise<RegistrationMutationResult> {
    const idx = this.registrations.findIndex((r) => r.id === id)
    if (idx === -1) {
      return { registration: undefined, registeredCount: 0 }
    }
    const existing = this.registrations[idx]
    if (existing.cancelledAt) {
      return { registration: existing, registeredCount: this.countActiveRegistrations(existing.activityId) }
    }
    const updated: Registration = {
      ...existing,
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    }
    this.registrations[idx] = updated
    return { registration: updated, registeredCount: this.countActiveRegistrations(existing.activityId) }
  }

  async deleteRegistration(activityId: string, wechat: string): Promise<RegistrationMutationResult> {
    const idx = this.registrations.findIndex((r) => r.activityId === activityId && r.wechat === wechat)
    if (idx === -1) {
      return { registration: undefined, registeredCount: this.countRegistrations(activityId) }
    }
    const [removed] = this.registrations.splice(idx, 1)
    return { registration: removed, registeredCount: this.countRegistrations(activityId) }
  }

  async getInterests(activityId: string): Promise<Interest[]> {
    return this.interests.filter((i) => i.activityId === activityId)
  }

  async findInterest(activityId: string, wechat: string): Promise<Interest | null> {
    return this.interests.find((i) => i.activityId === activityId && i.wechat === wechat) ?? null
  }

  async findInterestByUserId(activityId: string, userId: string): Promise<Interest | null> {
    return this.interests.find((i) => i.activityId === activityId && i.userId === userId) ?? null
  }

  async findInterestByDeviceId(activityId: string, deviceId: string): Promise<Interest | null> {
    return this.interests.find((i) => i.activityId === activityId && i.deviceId === deviceId) ?? null
  }

  async createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> {
    if (data.userId) {
      const existing = await this.findInterestByUserId(data.activityId, data.userId)
      if (existing) {
        return { interest: existing, interestedCount: this.syncInterestedCount(data.activityId) }
      }
    } else if (data.deviceId) {
      const existing = await this.findInterestByDeviceId(data.activityId, data.deviceId)
      if (existing) {
        return { interest: existing, interestedCount: this.syncInterestedCount(data.activityId) }
      }
    } else if (data.wechat) {
      const existing = await this.findInterest(data.activityId, data.wechat)
      if (existing) {
        return { interest: existing, interestedCount: this.syncInterestedCount(data.activityId) }
      }
    }
    const interest: Interest = {
      ...data,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
    }
    this.interests.push(interest)
    return { interest, interestedCount: this.syncInterestedCount(data.activityId) }
  }

  async deleteInterest(activityId: string, wechat: string): Promise<InterestMutationResult> {
    const idx = this.interests.findIndex((i) => i.activityId === activityId && i.wechat === wechat)
    if (idx === -1) {
      return { interest: undefined, interestedCount: this.syncInterestedCount(activityId) }
    }
    const [removed] = this.interests.splice(idx, 1)
    return { interest: removed, interestedCount: this.syncInterestedCount(activityId) }
  }

  async deleteInterestByUserId(activityId: string, userId: string): Promise<InterestMutationResult> {
    const idx = this.interests.findIndex((i) => i.activityId === activityId && i.userId === userId)
    if (idx === -1) {
      return { interest: undefined, interestedCount: this.syncInterestedCount(activityId) }
    }
    const [removed] = this.interests.splice(idx, 1)
    return { interest: removed, interestedCount: this.syncInterestedCount(activityId) }
  }

  async deleteInterestByDeviceId(activityId: string, deviceId: string): Promise<InterestMutationResult> {
    const idx = this.interests.findIndex((i) => i.activityId === activityId && i.deviceId === deviceId)
    if (idx === -1) {
      return { interest: undefined, interestedCount: this.syncInterestedCount(activityId) }
    }
    const [removed] = this.interests.splice(idx, 1)
    return { interest: removed, interestedCount: this.syncInterestedCount(activityId) }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) ?? null
  }

  async upsertProfile(data: Partial<Profile> & { id: string; nickname?: string }): Promise<Profile> {
    const existing = this.profiles.get(data.id)
    const nowIso = new Date().toISOString()
    const profile = withProfileDefaults({
      ...existing,
      ...data,
      nickname: data.nickname ?? existing?.nickname ?? '用户',
      updatedAt: nowIso,
      createdAt: existing?.createdAt ?? nowIso,
    })
    this.profiles.set(data.id, profile)
    return profile
  }

  async listProfilesWithPreference(pref: ProfileNotificationPreference): Promise<Profile[]> {
    return [...this.profiles.values()].filter((p) => p[pref] === true)
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    this.ensureSeedNotifications(userId)
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async getUnreadCount(userId: string): Promise<number> {
    this.ensureSeedNotifications(userId)
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length
  }

  async markAsRead(notificationId: string): Promise<void> {
    const n = this.notifications.find((item) => item.id === notificationId)
    if (n) n.isRead = true
  }

  async markAllAsRead(userId: string): Promise<void> {
    for (const n of this.notifications) {
      if (n.userId === userId) n.isRead = true
    }
  }

  async createNotification(
    data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>,
  ): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: nanoid(8),
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    this.notifications.push(notification)
    return notification
  }

  async countNotificationsSince(
    activityId: string,
    userId: string,
    type: Notification['type'],
    sinceIso: string,
  ): Promise<number> {
    const since = new Date(sinceIso).getTime()
    return this.notifications.filter(
      (n) =>
        n.activityId === activityId &&
        n.userId === userId &&
        n.type === type &&
        new Date(n.createdAt).getTime() >= since,
    ).length
  }

  async getInfoInterests(activityId: string): Promise<InfoInterest[]> {
    return this.infoInterests.filter((i) => i.activityId === activityId)
  }

  async findInfoInterestByUserId(activityId: string, userId: string): Promise<InfoInterest | null> {
    return this.infoInterests.find((i) => i.activityId === activityId && i.userId === userId) ?? null
  }

  async findInfoInterestByEmail(activityId: string, email: string): Promise<InfoInterest | null> {
    return this.infoInterests.find((i) => i.activityId === activityId && i.email === email) ?? null
  }

  async findInfoInterestByDeviceId(activityId: string, deviceId: string): Promise<InfoInterest | null> {
    return this.infoInterests.find((i) => i.activityId === activityId && i.deviceId === deviceId) ?? null
  }

  async createInfoInterest(data: Omit<InfoInterest, 'id' | 'createdAt'>): Promise<InfoInterest> {
    const interest: InfoInterest = {
      ...data,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
    }
    this.infoInterests.push(interest)
    return interest
  }

  async deleteInfoInterest(id: string): Promise<void> {
    this.infoInterests = this.infoInterests.filter((i) => i.id !== id)
  }

  async getRecruitingActivitiesInDateRange(fromIso: string, toIso: string): Promise<Activity[]> {
    const from = new Date(fromIso).getTime()
    const to = new Date(toIso).getTime()
    return this.activities.filter((a) => {
      if (a.status !== 'recruiting' || !a.date) return false
      const t = new Date(a.date).getTime()
      return t >= from && t <= to
    })
  }

  async getInfoActivitiesWithStartInRange(fromIso: string, toIso: string): Promise<Activity[]> {
    const from = new Date(fromIso).getTime()
    const to = new Date(toIso).getTime()
    return this.activities.filter((a) => {
      if (a.postType !== 'info' || !a.infoStartTime) return false
      const t = new Date(a.infoStartTime).getTime()
      return t >= from && t <= to
    })
  }

  async getInfoActivitiesWithDeadlineInRange(fromIso: string, toIso: string): Promise<Activity[]> {
    const from = new Date(fromIso).getTime()
    const to = new Date(toIso).getTime()
    return this.activities.filter((a) => {
      if (a.postType !== 'info' || !a.infoDeadline) return false
      const t = new Date(a.infoDeadline).getTime()
      return t >= from && t <= to
    })
  }
}
