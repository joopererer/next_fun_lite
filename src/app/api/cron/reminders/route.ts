import { runHandler } from '@/lib/apiRoute'
import { handleCronReminders } from '@/server/handlers/cron'

export async function GET(request: Request) {
  return runHandler(request, handleCronReminders)
}
