import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Create route matchers using Clerk's utilities
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/admin(.*)',
  '/admin(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/dashboard/einstellungen(.*)',
  '/dashboard/analytics(.*)',
  '/api/admin(.*)'
])

const isManagerPlusRoute = createRouteMatcher([
  '/dashboard/analytics(.*)',
  '/dashboard/kunden/export(.*)'
])

// Create the Clerk middleware
const clerkAuth = clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth()
  
  console.log('🔐 PRODUCTION MIDDLEWARE: Processing request')
  console.log(`📍 Path: ${req.nextUrl.pathname}`)
  console.log(`👤 User ID: ${userId || 'Not authenticated'}`)
  
  // Check if route requires authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      console.log('❌ Protected route - redirecting to sign-in')
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    console.log('✅ Protected route - user authenticated')
    
    // Get user role from session claims or default to STAFF
    const userRole = (sessionClaims?.metadata as any)?.role || 'STAFF'
    
    // Check admin routes
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      console.log(`❌ Admin route denied for role: ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Check manager+ routes
    if (isManagerPlusRoute(req) && !['ADMIN', 'MANAGER'].includes(userRole)) {
      console.log(`❌ Manager+ route denied for role: ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    console.log(`✅ Access granted for role: ${userRole}`)
  }
  
  console.log('🚀 Request allowed - proceeding')
  return NextResponse.next()
})

// Export the middleware wrapped to be callable with just (request)
export default clerkAuth

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ]
}