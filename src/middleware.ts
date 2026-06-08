import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/event/(.*)',
  '/cancel/(.*)',
  '/proposals',
  '/info/new',
  '/api/info',
  '/api/activities(.*)',
  '/api/parse(.*)',
  '/api/registrations',
  '/api/interests(.*)',
  '/api/cancel/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
