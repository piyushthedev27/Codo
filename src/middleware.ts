import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/lessons(.*)',
  '/coding(.*)',
  '/insights(.*)',
])

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/features',
  '/pricing',
  '/avatar-demo',
  '/knowledge-graph-demo',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    try {
      await auth.protect()
    } catch (error) {
      // Log the error for debugging
      console.warn('Clerk auth error:', error.message)
      
      // If it's a JWT timing issue, redirect to sign-in
      if (error.message.includes('token-not-active-yet') || 
          error.message.includes('nbf') ||
          error.message.includes('infinite redirect')) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return Response.redirect(signInUrl)
      }
      
      // Re-throw other errors
      throw error
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}