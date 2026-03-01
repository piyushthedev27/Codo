import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/lessons(.*)',
  '/coding(.*)',
  '/insights(.*)',
  // Protect demo/test routes so they don't expose internal UI
  '/avatar-demo(.*)',
  '/knowledge-graph-demo(.*)',
  '/mistake-analyzer-demo(.*)',
  '/theme-test(.*)',
  '/voice-demo(.*)',
  '/mobile-voice-test(.*)',
  '/navigation-demo(.*)',
])

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/features',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// Routes that require onboarding to be complete before access
const requiresOnboarding = createRouteMatcher([
  '/dashboard(.*)',
  '/lessons(.*)',
  '/coding(.*)',
  '/insights(.*)',
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
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn('Clerk auth error:', errorMessage)

      // If it's a JWT timing issue, redirect to sign-in
      if (errorMessage.includes('token-not-active-yet') ||
        errorMessage.includes('nbf') ||
        errorMessage.includes('infinite redirect')) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return Response.redirect(signInUrl)
      }

      // Re-throw other errors
      throw error
    }

    // Check onboarding completion for main app routes.
    // Guards: skip for API routes (performance) and /onboarding itself (prevent redirect loop).
    const pathname = req.nextUrl.pathname
    const isApiRequest = pathname.startsWith('/api/')
    const isOnboardingPage = pathname.startsWith('/onboarding')

    if (requiresOnboarding(req) && !isApiRequest && !isOnboardingPage) {
      try {
        const { userId } = await auth()
        if (userId) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

          if (supabaseUrl && supabaseServiceKey) {
            // Use service-role key to bypass RLS for this internal check
            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
              auth: { persistSession: false }
            })

            const { data } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('clerk_user_id', userId)
              .maybeSingle()

            // If no profile found, the user hasn't completed onboarding
            if (!data) {
              const onboardingUrl = new URL('/onboarding', req.url)
              return NextResponse.redirect(onboardingUrl)
            }
          }
        }
      } catch (onboardingCheckError) {
        // If the supabase check fails, allow through rather than blocking the user
        console.warn('Onboarding check failed (allowing through):', onboardingCheckError)
      }
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