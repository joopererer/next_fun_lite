import type { EnvConfig } from '../../shared/types'
import { GoogleSheetsAdapter } from './googleSheets'
import { MockAdapter } from './mock'
import { SupabaseAdapter } from './supabase'
import { TencentDocsAdapter } from './tencentDocs'
import type { StorageAdapter } from './types'

export function createStorageAdapter(env?: EnvConfig): StorageAdapter {
  const backend = env?.STORAGE_BACKEND ?? process.env.STORAGE_BACKEND ?? 'mock'

  switch (backend) {
    case 'google_sheets':
      return new GoogleSheetsAdapter(env)
    case 'supabase':
      return new SupabaseAdapter()
    case 'tencent_docs':
      return new TencentDocsAdapter()
    default:
      return new MockAdapter()
  }
}

export type { StorageAdapter } from './types'
