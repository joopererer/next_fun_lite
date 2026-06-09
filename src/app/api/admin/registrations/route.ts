import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleAdminCreateRegistration } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, (req, env) => handleAdminCreateRegistration(req, env))
}
