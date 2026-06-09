import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleAdminImport } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, (req, env) => handleAdminImport(req, env))
}
