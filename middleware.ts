import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// DEVELOPMENT MODE - Skip authentication if Clerk keys are not properly configured
const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_clerk_publishable_key_here') ||
   process.env.CLERK_SECRET_KEY?.includes('your_clerk_secret_key_here') ||
   !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') ||
   !process.env.CLERK_SECRET_KEY?.startsWith('sk_'))

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/admin(.*)',
  '/admin(.*)'
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/dashboard/settings(.*)',
  '/dashboard/users(.*)',
  '/api/admin(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication in development mode with invalid Clerk keys
  if (isDevelopmentMode) {
    console.log('🔥 DEVELOPMENT MODE: Skipping Clerk authentication')
    console.log('📋 To enable authentication, get real Clerk keys from https://dashboard.clerk.com')
    return NextResponse.next()
  }

  try {
    // Get the user's authentication status
    const { userId, sessionClaims } = await auth()
    
    // Protect routes that require authentication
    if (isProtectedRoute(req)) {
      if (!userId) {
        // Redirect to sign-in if not authenticated
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Protect admin-only routes
    if (isAdminRoute(req)) {
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url)
        return NextResponse.redirect(signInUrl)
      }
      
      // Check if user has admin role (we'll implement this logic later)
      const userRole = sessionClaims?.role || 'STAFF'
      if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        // Redirect to dashboard if not admin/manager
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ Clerk middleware error:', error)
    // In development, continue anyway
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Continuing despite Clerk error')
      return NextResponse.next()
    }
    throw error
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}