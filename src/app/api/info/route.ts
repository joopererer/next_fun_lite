import { runHandler } from '@/lib/apiRoute'
import { handleCreateInfo } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, (req, env) => handleCreateInfo(req, env))
}
