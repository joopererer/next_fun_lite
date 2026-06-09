import { runHandlerWithRevalidate } from '@/lib/runHandlerWithRevalidate'
import { handleMutateInterest, handleDeleteInterest } from '@/server/handlers'

export async function POST(request: Request) {
  return runHandlerWithRevalidate(request, handleMutateInterest)
}

export async function DELETE(request: Request) {
  return runHandlerWithRevalidate(request, handleDeleteInterest)
}
