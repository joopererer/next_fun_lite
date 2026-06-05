import type { Activity, Interest, Registration } from '../../shared/types'
import type { InterestMutationResult, RegistrationMutationResult, StorageAdapter } from './types'

const TODO = 'TODO: TencentDocsAdapter not implemented'

export class TencentDocsAdapter implements StorageAdapter {
  async getActivities(): Promise<Activity[]> { throw new Error(TODO) }
  async getActivity(_id: string): Promise<Activity | null> { throw new Error(TODO) }
  async createActivity(_data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> { throw new Error(TODO) }
  async updateActivity(_id: string, _data: Partial<Activity>): Promise<Activity> { throw new Error(TODO) }
  async deleteActivity(_id: string): Promise<void> { throw new Error(TODO) }
  async getRegistrations(_activityId: string): Promise<Registration[]> { throw new Error(TODO) }
  async findRegistration(_activityId: string, _wechat: string): Promise<Registration | null> { throw new Error(TODO) }
  async createRegistration(_data: Omit<Registration, 'id' | 'registeredAt'>): Promise<Registration> { throw new Error(TODO) }
  async deleteRegistration(_activityId: string, _wechat: string): Promise<RegistrationMutationResult> { throw new Error(TODO) }
  async getInterests(_activityId: string): Promise<Interest[]> { throw new Error(TODO) }
  async findInterest(_activityId: string, _wechat: string): Promise<Interest | null> { throw new Error(TODO) }
  async createInterest(_data: Omit<Interest, 'id' | 'createdAt'>): Promise<InterestMutationResult> { throw new Error(TODO) }
  async deleteInterest(_activityId: string, _wechat: string): Promise<InterestMutationResult> { throw new Error(TODO) }
}
