import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleCreateRecruitment } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, handleCreateRecruitment)
}
