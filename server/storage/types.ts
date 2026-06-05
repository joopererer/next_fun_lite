import type { Activity, Interest, Registration } from '../../shared/types'

export interface InterestMutationResult {
  interestedCount: number
}

export interface RegistrationMutationResult {
  registration?: Registration
  registeredCount: number
}

export interface StorageAdapter {
  getActivities(): Promise<Activity[]>
  getActivity(id: string): Promise<Activity | null>
  createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>
  updateActivity(id: string, data: Partial<Activity>): Promise<Activity>
  deleteActivity(id: string): Promise<void>

  getRegistrations(activityId: string): Promise<Registration[]>
  findRegistration(activityId: string, wechat: string): Promise<Registration | null>
  createRegistration(data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration>
  deleteRegistration(activityId: string, wechat: string): Promise<RegistrationMutationResult>

  getInterests(activityId: string): Promise<Interest[]>
  findInterest(activityId: string, wechat: string): Promise<Interest | null>
  createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult>
  deleteInterest(activityId: string, wechat: string): Promise<InterestMutationResult>
}
