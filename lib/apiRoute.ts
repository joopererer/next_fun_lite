import { getEnvConfig } from '@/lib/env'
import type { EnvConfig } from '@/shared/types'

type RouteHandler = (
  request: Request,
  env: EnvConfig,
  params: Record<string, string>,
) => Promise<Response>

export async function runHandler(
  request: Request,
  handler: RouteHandler,
  params: Record<string, string> = {},
): Promise<Response> {
  const env = getEnvConfig()
  try {
    return await handler(request, env, params)
  } catch (err) {
    console.error(err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
