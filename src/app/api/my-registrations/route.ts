import { runHandler } from '@/lib/apiRoute'
import { handleGetMyRegistrations } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, handleGetMyRegistrations)
}
