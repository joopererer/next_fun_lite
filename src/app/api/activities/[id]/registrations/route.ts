import { runHandler } from '@/lib/apiRoute'
import { handleGetRegistrations } from '@/server/handlers'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleGetRegistrations(req, env, id), { id })
}
