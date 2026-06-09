import { runHandler } from '@/lib/apiRoute'
import { revalidateActivitiesCache } from '@/lib/revalidateActivities'
import type { EnvConfig } from '@/shared/types'

type RouteHandler = (
  request: Request,
  env: EnvConfig,
  params: Record<string, string>,
) => Promise<Response>

export async function runHandlerWithRevalidate(
  request: Request,
  handler: RouteHandler,
  params: Record<string, string> = {},
): Promise<Response> {
  const res = await runHandler(request, handler, params)
  if (res.ok) {
    revalidateActivitiesCache()
  }
  return res
}
