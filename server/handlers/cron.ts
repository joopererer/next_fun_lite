import { auth } from '@clerk/nextjs/server'
import type { EnvConfig } from '@/shared/types'
import { runReminderCron } from '@/server/notifications/cron'
import { errorResponse, jsonResponse } from '../lib/utils'

export async function handleCronReminders(request: Request, env: EnvConfig): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  const secret = env.CRON_SECRET ?? process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return errorResponse('Unauthorized', 401)
  }

  const result = await runReminderCron(env)
  return jsonResponse(result)
}
