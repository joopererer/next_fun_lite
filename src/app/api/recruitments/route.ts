import { runHandler } from '@/lib/apiRoute'
import { handleCreateRecruitment } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, handleCreateRecruitment)
}
