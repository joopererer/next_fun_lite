import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleCreateInfo } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, (req, env) => handleCreateInfo(req, env))
}
