import { runHandler } from '@/lib/apiRoute'
import { jsonResponse, requireAdminAuth } from '@/server/lib/utils'

export async function GET(request: Request) {
  return runHandler(request, async (req, env) => {
    const authErr = requireAdminAuth(req, env)
    if (authErr) return authErr
    return jsonResponse({ ok: true })
  })
}
