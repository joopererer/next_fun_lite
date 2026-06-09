import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleDeleteInterest } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, handleDeleteInterest)
}
