import { runHandler } from '@/lib/apiRoute'
import { handleGetInfoInterestStatus } from '@/server/handlers/infoInterests'

type Params = { params: Promise<{ activityId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { activityId } = await params
  return runHandler(request, (req, env) => handleGetInfoInterestStatus(req, env, activityId), {
    activityId,
  })
}
