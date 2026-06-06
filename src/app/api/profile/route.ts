import { runHandler } from '@/lib/apiRoute'
import { handleGetProfile, handleUpsertProfile } from '@/server/handlers/profile'

export async function GET(request: Request) {
  return runHandler(request, handleGetProfile)
}

export async function POST(request: Request) {
  return runHandler(request, handleUpsertProfile)
}
