import { runHandler } from '@/lib/apiRoute'
import { handleCreateRegistration } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, handleCreateRegistration)
}
