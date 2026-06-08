import { runHandler } from '@/lib/apiRoute'
import { handleCancelByToken, handleGetRegistrationByToken } from '@/server/handlers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  return runHandler(request, (req, env) => handleGetRegistrationByToken(req, env, token))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  return runHandler(request, (req, env) => handleCancelByToken(req, env, token))
}
