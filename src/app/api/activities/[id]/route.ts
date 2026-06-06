import { runHandler } from '@/lib/apiRoute'
import {
  handleDeleteActivity,
  handleGetActivity,
  handleUpdateActivity,
} from '@/server/handlers'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleGetActivity(req, env, id), { id })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleUpdateActivity(req, env, id), { id })
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  return runHandler(request, (req, env) => handleDeleteActivity(req, env, id), { id })
}
