import { runHandler } from '@/lib/apiRoute'
import { handleGetMyRegistration } from '@/server/handlers'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleGetMyRegistration(req, env, id), { id })
}
