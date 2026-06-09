import type { Activity, InfoInterest, Interest, Notification, Profile, ProfileNotificationPreference, Registration } from '../../shared/types'
import type { InterestMutationResult, RegistrationMutationResult, StorageAdapter } from './types'

const TODO = 'TODO: TencentDocsAdapter not implemented'

export class TencentDocsAdapter implements StorageAdapter {
  async getActivities(): Promise<Activity[]> { throw new Error(TODO) }
  async getActivity(_id: string): Promise<Activity | null> { throw new Error(TODO) }
  async getActivitiesByIds(_ids: string[]): Promise<Activity[]> { throw new Error(TODO) }
  async addLinkedRecruit(_proposalId: string, _recruitId: string): Promise<void> { throw new Error(TODO) }
  async createActivity(_data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> { throw new Error(TODO) }
  async updateActivity(_id: string, _data: Partial<Activity>): Promise<Activity> { throw new Error(TODO) }
  async deleteActivity(_id: string): Promise<void> { throw new Error(TODO) }
  async getRegistrations(_activityId: string): Promise<Registration[]> { throw new Error(TODO) }
  async getActiveRegistrations(_activityId: string): Promise<Registration[]> { throw new Error(TODO) }
  async getRegistrationsByUser(_userId: string): Promise<Registration[]> { throw new Error(TODO) }
  async getRegistrationById(_id: string): Promise<Registration | null> { throw new Error(TODO) }
  async getRegistrationByToken(_token: string): Promise<Registration | null> { throw new Error(TODO) }
  async findRegistration(_activityId: string, _wechat: string): Promise<Registration | null> { throw new Error(TODO) }
  async findRegistrationByNameAndWechat(_activityId: string, _name: string, _wechat: string): Promise<Registration | null> { throw new Error(TODO) }
  async createRegistration(_data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration> { throw new Error(TODO) }
  async cancelRegistration(_id: string, _cancelledBy: 'user' | 'admin'): Promise<RegistrationMutationResult> { throw new Error(TODO) }
  async deleteRegistration(_activityId: string, _wechat: string): Promise<RegistrationMutationResult> { throw new Error(TODO) }
  async getInterests(_activityId: string): Promise<Interest[]> { throw new Error(TODO) }
  async findInterest(_activityId: string, _wechat: string): Promise<Interest | null> { throw new Error(TODO) }
  async findInterestByUserId(_activityId: string, _userId: string): Promise<Interest | null> { throw new Error(TODO) }
  async findInterestByDeviceId(_activityId: string, _deviceId: string): Promise<Interest | null> { throw new Error(TODO) }
  async createInterest(_data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> { throw new Error(TODO) }
  async deleteInterest(_activityId: string, _wechat: string): Promise<InterestMutationResult> { throw new Error(TODO) }
  async deleteInterestByUserId(_activityId: string, _userId: string): Promise<InterestMutationResult> { throw new Error(TODO) }
  async deleteInterestByDeviceId(_activityId: string, _deviceId: string): Promise<InterestMutationResult> { throw new Error(TODO) }
  async getProfile(_userId: string): Promise<Profile | null> { throw new Error(TODO) }
  async upsertProfile(_data: Partial<Profile> & { id: string; nickname?: string }): Promise<Profile> { throw new Error(TODO) }
  async listProfilesWithPreference(_pref: ProfileNotificationPreference): Promise<Profile[]> { throw new Error(TODO) }
  async getNotifications(_userId: string, _limit?: number): Promise<Notification[]> { throw new Error(TODO) }
  async getUnreadCount(_userId: string): Promise<number> { throw new Error(TODO) }
  async markAsRead(_notificationId: string): Promise<void> { throw new Error(TODO) }
  async markAllAsRead(_userId: string): Promise<void> { throw new Error(TODO) }
  async createNotification(_data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> { throw new Error(TODO) }
  async countNotificationsSince(_activityId: string, _userId: string, _type: Notification['type'], _sinceIso: string): Promise<number> { throw new Error(TODO) }
  async getInfoInterests(_activityId: string): Promise<InfoInterest[]> { throw new Error(TODO) }
  async findInfoInterestByUserId(_activityId: string, _userId: string): Promise<InfoInterest | null> { throw new Error(TODO) }
  async findInfoInterestByEmail(_activityId: string, _email: string): Promise<InfoInterest | null> { throw new Error(TODO) }
  async findInfoInterestByDeviceId(_activityId: string, _deviceId: string): Promise<InfoInterest | null> { throw new Error(TODO) }
  async createInfoInterest(_data: Omit<InfoInterest, 'id' | 'createdAt'>): Promise<InfoInterest> { throw new Error(TODO) }
  async deleteInfoInterest(_id: string): Promise<void> { throw new Error(TODO) }
  async getRecruitingActivitiesInDateRange(_fromIso: string, _toIso: string): Promise<Activity[]> { throw new Error(TODO) }
  async getInfoActivitiesWithStartInRange(_fromIso: string, _toIso: string): Promise<Activity[]> { throw new Error(TODO) }
  async getInfoActivitiesWithDeadlineInRange(_fromIso: string, _toIso: string): Promise<Activity[]> { throw new Error(TODO) }
}
