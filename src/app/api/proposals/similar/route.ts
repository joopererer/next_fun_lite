import { runHandler } from '@/lib/apiRoute'
import { handleFindSimilarProposals } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, (req, env) => handleFindSimilarProposals(req, env))
}
