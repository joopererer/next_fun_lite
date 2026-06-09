import { runHandler } from '@/lib/apiRoute'
import { handleAdminSearchProfiles } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, handleAdminSearchProfiles)
}
