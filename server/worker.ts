import type { EnvConfig } from '../shared/types'
import { handleApiRequest } from './router'
import { getEnvConfig } from './lib/utils'

export interface WorkerEnv extends EnvConfig {
  [key: string]: string | undefined
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api')) {
      return new Response('Not found', { status: 404 })
    }
    return handleApiRequest(request, getEnvConfig(env))
  },
}
