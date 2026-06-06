import type { EnvConfig } from '../../shared/types'
import { GoogleSheetsAdapter } from './googleSheets'
import { MockAdapter } from './mock'
import { SupabaseAdapter } from './supabase'
import { TencentDocsAdapter } from './tencentDocs'
import type { StorageAdapter } from './types'

const globalForMock = globalThis as typeof globalThis & { __nflMockAdapter?: MockAdapter }

function getMockAdapter(): MockAdapter {
  if (!globalForMock.__nflMockAdapter) {
    globalForMock.__nflMockAdapter = new MockAdapter()
  }
  return globalForMock.__nflMockAdapter
}

export function createStorageAdapter(env?: EnvConfig): StorageAdapter {
  const backend = env?.STORAGE_BACKEND ?? process.env.STORAGE_BACKEND ?? 'mock'

  switch (backend) {
    case 'google_sheets':
      return new GoogleSheetsAdapter(env)
    case 'supabase':
      return new SupabaseAdapter(env)
    case 'tencent_docs':
      return new TencentDocsAdapter()
    default:
      return getMockAdapter()
  }
}

export type { StorageAdapter } from './types'
