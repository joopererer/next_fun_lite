import { runHandler } from '@/lib/apiRoute'
import { handleGetRegistrationSummary } from '@/server/handlers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return runHandler(request, (req, env) => handleGetRegistrationSummary(req, env, id))
}
