import { runHandler } from '@/lib/apiRoute'
import { handleMarkNotificationRead } from '@/server/handlers/notifications'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleMarkNotificationRead(req, env, id), { id })
}
