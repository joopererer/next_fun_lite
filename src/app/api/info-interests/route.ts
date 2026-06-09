import { runHandler } from '@/lib/apiRoute'
import { handleCreateInfoInterest, handleDeleteInfoInterest } from '@/server/handlers/infoInterests'

export async function POST(request: Request) {
  return runHandler(request, handleCreateInfoInterest)
}

export async function DELETE(request: Request) {
  return runHandler(request, handleDeleteInfoInterest)
}
