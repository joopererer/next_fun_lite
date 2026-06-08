import { runHandler } from '@/lib/apiRoute'
import { handleAdminImport } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, (req, env) => handleAdminImport(req, env))
}
