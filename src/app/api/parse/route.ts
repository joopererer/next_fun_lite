import { runHandler } from '@/lib/apiRoute'
import { handleParse } from '@/server/handlers/parse'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  return runHandler(request, handleParse)
}
