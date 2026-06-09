import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleCreateRegistration } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, handleCreateRegistration)
}
