import { runHandler } from '@/lib/apiRoute'
import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleCreateActivity, handleGetActivities } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, handleGetActivities)
}

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, (req, env) => handleCreateActivity(req, env, false))
}
