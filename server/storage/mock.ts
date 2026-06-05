import { nanoid } from 'nanoid'
import type { Activity, Interest, Registration } from '../../shared/types'
import type { InterestMutationResult, StorageAdapter } from './types'

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()
const futureDate = (days: number, hour = 9) => {
  const d = new Date(now.getTime() + days * 86400000)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

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
      sourceUrl: 'https://www.sortiraparis.com/example',
      status: 'proposed',
      category: 'dining',
      interestedCount: 5,
      createdAt: daysAgo(2),
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
    },
    {
      id: 'recr001',
      title: 'Rambouillet 徒步',
      description: '从 Saint-Lazare 坐火车去 Rambouillet 森林徒步，约 12km，中等难度，风景优美。适合有一定体力、喜欢户外的朋友。',
      date: futureDate(10, 9),
      location: 'Saint-Lazare 站集合',
      maxParticipants: 10,
      fee: '火车票自理，约 15€',
      notes: '请穿运动鞋\n自备午餐和水\n雨天取消',
      organizerName: 'James',
      organizerWechat: 'james123',
      sourceUrl: '',
      status: 'recruiting',
      category: 'sports',
      interestedCount: 0,
      createdAt: daysAgo(7),
    },
    {
      id: 'recr002',
      title: 'Vanves 跳蚤市场',
      description: '巴黎最受欢迎的跳蚤市场之一，淘 vintage 好物，早去早好，逛完可以附近 brunch。',
      date: futureDate(3, 8),
      location: 'Marché aux Puces de Vanves',
      maxParticipants: 8,
      fee: '免费入场',
      notes: '建议带现金\n市场 7:00-14:00',
      organizerName: 'Amy',
      organizerWechat: 'amy_vintage',
      sourceUrl: 'https://www.pucesdevanves.fr/',
      status: 'recruiting',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(3),
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
      status: 'ended',
      category: 'culture',
      interestedCount: 0,
      createdAt: daysAgo(30),
    },
  ]
}

function seedRegistrations(): Registration[] {
  return [
    { id: 'reg001', activityId: 'recr001', name: 'James', wechat: 'james123', participantCount: 2, note: '有车', registeredAt: daysAgo(6) },
    { id: 'reg002', activityId: 'recr001', name: 'Cette糖', wechat: 'cette456', participantCount: 1, note: '', registeredAt: daysAgo(5) },
    { id: 'reg003', activityId: 'recr001', name: '小明', wechat: 'xiaoming88', participantCount: 2, note: '', registeredAt: daysAgo(4) },
    { id: 'reg004', activityId: 'recr001', name: 'Lily', wechat: 'lily_art', participantCount: 2, note: '素食', registeredAt: daysAgo(3) },
    { id: 'reg005', activityId: 'recr002', name: 'Amy', wechat: 'amy_vintage', participantCount: 1, note: '发起人', registeredAt: daysAgo(2) },
    { id: 'reg006', activityId: 'recr002', name: 'Tom', wechat: 'tom_photo', participantCount: 1, note: '', registeredAt: daysAgo(1) },
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
  ]
}

export class MockAdapter implements StorageAdapter {
  private activities: Activity[]
  private registrations: Registration[]
  private interests: Interest[]

  constructor() {
    this.activities = seedActivities()
    this.registrations = seedRegistrations()
    this.interests = seedInterests()
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

  async createRegistration(data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration> {
    const registration: Registration = {
      ...data,
      id: nanoid(8),
      registeredAt: new Date().toISOString(),
    }
    this.registrations.push(registration)
    return registration
  }

  async getInterests(activityId: string): Promise<Interest[]> {
    return this.interests.filter((i) => i.activityId === activityId)
  }

  async findInterest(activityId: string, wechat: string): Promise<Interest | null> {
    return this.interests.find((i) => i.activityId === activityId && i.wechat === wechat) ?? null
  }

  async createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> {
    const existing = await this.findInterest(data.activityId, data.wechat)
    if (existing) {
      return { interest: existing, interestedCount: this.syncInterestedCount(data.activityId) }
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
}
