import { runHandler } from '@/lib/apiRoute'
import { checkAdminAuth, errorResponse, jsonResponse } from '@/server/lib/utils'

export async function GET(request: Request) {
  return runHandler(request, async (req, env) => {
    if (!checkAdminAuth(req, env)) return errorResponse('Unauthorized', 401)
    return jsonResponse({ ok: true })
  })
}
