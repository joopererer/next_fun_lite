import type { Activity, Interest, Registration } from '../../shared/types'

export interface StorageAdapter {
  getActivities(): Promise<Activity[]>
  getActivity(id: string): Promise<Activity | null>
  createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>
  updateActivity(id: string, data: Partial<Activity>): Promise<Activity>
  deleteActivity(id: string): Promise<void>

  getRegistrations(activityId: string): Promise<Registration[]>
  createRegistration(data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration>

  getInterests(activityId: string): Promise<Interest[]>
  createInterest(data: Omit<Interest, 'id' | 'createdAt'>): Promise<Interest>
}
