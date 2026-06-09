import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleAdminUpdateRegistration, handleDeleteRegistration } from '@/server/handlers'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return runHandlerWithRevalidate(request, (req, env) => handleAdminUpdateRegistration(req, env, id))
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return runHandlerWithRevalidate(request, (req, env) => handleDeleteRegistration(req, env, id))
}
