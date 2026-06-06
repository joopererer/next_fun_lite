import { runHandler } from '@/lib/apiRoute'
import { handleCreateActivity } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, (req, env) => handleCreateActivity(req, env, true))
}
