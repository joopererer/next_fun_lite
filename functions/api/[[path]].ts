import type { EnvConfig } from '../../shared/types'
import { getEnvConfig } from '../../server/lib/utils'
import { handleApiRequest } from '../../server/router'

export const onRequest: PagesFunction<EnvConfig> = async (context) => {
  return handleApiRequest(context.request, getEnvConfig(context.env))
}
