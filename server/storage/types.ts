import type {
  Activity,
  Interest,
  Notification,
  Profile,
  ProfileNotificationPreference,
  Registration,
} from '../../shared/types'

export interface InterestMutationResult {
  interest?: Interest
  interestedCount: number
}

export interface RegistrationMutationResult {
  registration?: Registration
  registeredCount: number
}

export interface GetNotificationsOptions {
  limit?: number
  unreadOnly?: boolean
}

export interface StorageAdapter {
  getActivities(): Promise<Activity[]>
  getActivity(id: string): Promise<Activity | null>
  createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>
  updateActivity(id: string, data: Partial<Activity>): Promise<Activity>
  deleteActivity(id: string): Promise<void>

  getRegistrations(activityId: string): Promise<Registration[]>
  getActiveRegistrations(activityId: string): Promise<Registration[]>
  getRegistrationsByUser(userId: string): Promise<Registration[]>
  getRegistrationById(id: string): Promise<Registration | null>
  getRegistrationByToken(token: string): Promise<Registration | null>
  findRegistration(activityId: string, wechat: string): Promise<Registration | null>
  findRegistrationByNameAndWechat(activityId: string, name: string, wechat: string): Promise<Registration | null>
  findInterestByUserId(activityId: string, userId: string): Promise<Interest | null>
  findInterestByDeviceId(activityId: string, deviceId: string): Promise<Interest | null>
  createRegistration(data: Omit<Registration, 'id' | 'registeredAt'> & { registeredAt?: string }): Promise<Registration>
  cancelRegistration(id: string, cancelledBy: 'user' | 'admin'): Promise<RegistrationMutationResult>
  deleteRegistration(activityId: string, wechat: string): Promise<RegistrationMutationResult>

  getInterests(activityId: string): Promise<Interest[]>
  findInterest(activityId: string, wechat: string): Promise<Interest | null>
  createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult>
  deleteInterest(activityId: string, wechat: string): Promise<InterestMutationResult>
  deleteInterestByUserId(activityId: string, userId: string): Promise<InterestMutationResult>
  deleteInterestByDeviceId(activityId: string, deviceId: string): Promise<InterestMutationResult>

  getActivitiesByIds(ids: string[]): Promise<Activity[]>
  addLinkedRecruit(proposalId: string, recruitId: string): Promise<void>

  getProfile(userId: string): Promise<Profile | null>
  upsertProfile(data: Partial<Profile> & { id: string; nickname?: string }): Promise<Profile>
  listProfilesWithPreference(pref: ProfileNotificationPreference): Promise<Profile[]>

  getNotifications(userId: string, options?: GetNotificationsOptions): Promise<Notification[]>
  markAllAsRead(userId: string): Promise<void>
  createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification>
}
