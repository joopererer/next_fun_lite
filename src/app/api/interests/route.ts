import { runHandler } from '@/lib/apiRoute'
import { handleMutateInterest, handleDeleteInterest } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandler(request, handleMutateInterest)
}

export async function DELETE(request: Request) {
  return runHandler(request, handleDeleteInterest)
}
