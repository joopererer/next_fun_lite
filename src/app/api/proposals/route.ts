import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleCreateActivity } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, (req, env) => handleCreateActivity(req, env, true))
}
