import { runHandler } from '@/lib/apiRoute'
import { handleDeleteInterest } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, handleDeleteInterest)
}
