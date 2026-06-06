import { runHandler } from '@/lib/apiRoute'
import { handleDeleteRegistration } from '@/server/handlers'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return runHandler(request, (req, env) => handleDeleteRegistration(req, env, id))
}
