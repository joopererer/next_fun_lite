import type { EnvConfig } from '../shared/types'
import {
  handleCreateActivity,
  handleCreateRecruitment,
  handleMutateInterest,
  handleCreateRegistration,
  handleDeleteInterest,
  handleDeleteActivity,
  handleGetActivities,
  handleGetActivitiesByIds,
  handleGetActivity,
  handleGetInterests,
  handleGetRegistrations,
  handleGetMyRegistration,
  handleUpdateActivity,
} from './handlers'
import { handleParse } from './handlers/parse'
import { errorResponse } from './lib/utils'

type RouteHandler = (request: Request, env: EnvConfig, params: Record<string, string>) => Promise<Response>

const routes: Array<{
  method: string
  pattern: RegExp
  handler: RouteHandler
}> = [
  { method: 'GET', pattern: /^\/api\/activities$/, handler: (req, env) => handleGetActivities(req, env) },
  {
    method: 'GET',
    pattern: /^\/api\/activities\/by-ids$/,
    handler: (req, env) => handleGetActivitiesByIds(req, env),
  },
  {
    method: 'GET',
    pattern: /^\/api\/activities\/([^/]+)$/,
    handler: (req, env, p) => handleGetActivity(req, env, p.id),
  },
  {
    method: 'POST',
    pattern: /^\/api\/activities$/,
    handler: (req, env) => handleCreateActivity(req, env, false),
  },
  {
    method: 'POST',
    pattern: /^\/api\/proposals$/,
    handler: (req, env) => handleCreateActivity(req, env, true),
  },
  { method: 'POST', pattern: /^\/api\/recruitments$/, handler: (req, env) => handleCreateRecruitment(req, env) },
  {
    method: 'PATCH',
    pattern: /^\/api\/activities\/([^/]+)$/,
    handler: (req, env, p) => handleUpdateActivity(req, env, p.id),
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/activities\/([^/]+)$/,
    handler: (req, env, p) => handleDeleteActivity(req, env, p.id),
  },
  {
    method: 'GET',
    pattern: /^\/api\/activities\/([^/]+)\/registration$/,
    handler: (req, env, p) => handleGetMyRegistration(req, env, p.id),
  },
  {
    method: 'GET',
    pattern: /^\/api\/activities\/([^/]+)\/registrations$/,
    handler: (req, env, p) => handleGetRegistrations(req, env, p.id),
  },
  { method: 'POST', pattern: /^\/api\/registrations$/, handler: (req, env) => handleCreateRegistration(req, env) },
  {
    method: 'GET',
    pattern: /^\/api\/activities\/([^/]+)\/interests$/,
    handler: (req, env, p) => handleGetInterests(req, env, p.id),
  },
  { method: 'POST', pattern: /^\/api\/interests$/, handler: (req, env) => handleMutateInterest(req, env) },
  { method: 'POST', pattern: /^\/api\/interests\/remove$/, handler: (req, env) => handleDeleteInterest(req, env) },
  { method: 'DELETE', pattern: /^\/api\/interests$/, handler: (req, env) => handleDeleteInterest(req, env) },
  { method: 'POST', pattern: /^\/api\/parse$/, handler: (req, env) => handleParse(req, env) },
]

function matchRoute(method: string, pathname: string): { handler: RouteHandler; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue
    const match = pathname.match(route.pattern)
    if (!match) continue
    const params: Record<string, string> = {}
    if (match[1]) params.id = match[1]
    return { handler: route.handler, params }
  }
  return null
}

export async function handleApiRequest(request: Request, env: EnvConfig): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname.replace(/\/$/, '') || '/'

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    })
  }

  const matched = matchRoute(request.method, pathname)
  if (!matched) return errorResponse('Not found', 404)

  try {
    const response = await matched.handler(request, env, matched.params)
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    return new Response(response.body, { status: response.status, headers })
  } catch (err) {
    console.error(err)
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500)
  }
}
