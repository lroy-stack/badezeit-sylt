import { NextRequest, NextResponse } from 'next/server'
import { DEV_USERS, PROTECTED_ROUTES, ADMIN_ONLY_ROUTES, MANAGER_PLUS_ROUTES } from './types'

// Development session management
const DEV_SESSION_COOKIE = 'badezeit-dev-session'
const DEFAULT_DEV_USER = 'demo-admin'

// Simple route matching function (no Clerk dependency)
function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace('(.*)', '.*'))
    return regex.test(pathname)
  })
}

// Get or create development session
function getDevSession(request: NextRequest): string {
  let sessionId = request.cookies.get(DEV_SESSION_COOKIE)?.value
  
  if (!sessionId || !DEV_USERS[sessionId]) {
    sessionId = DEFAULT_DEV_USER
  }
  
  return sessionId
}

// Development authentication middleware
export default async function devMiddleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname
  
  console.log('🛠️ DEVELOPMENT MIDDLEWARE: Processing request')
  console.log(`📍 Path: ${pathname}`)
  
  // Get development session
  const sessionId = getDevSession(request)
  const user = DEV_USERS[sessionId]
  
  console.log(`👤 Dev User: ${user.firstName} ${user.lastName} (${user.role})`)
  
  // Create response
  const response = NextResponse.next()
  
  // Set development session cookie if not already set
  if (!request.cookies.get(DEV_SESSION_COOKIE)) {
    response.cookies.set(DEV_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
  }
  
  // Add auth headers for downstream consumption
  response.headers.set('x-dev-user-id', user.id)
  response.headers.set('x-dev-user-role', user.role)
  response.headers.set('x-dev-user-email', user.email)
  response.headers.set('x-dev-mode', 'true')
  
  // Check route protection
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    console.log('🔒 Protected route - allowing access in dev mode')
  }
  
  if (matchesRoute(pathname, ADMIN_ONLY_ROUTES)) {
    if (user.role !== 'ADMIN') {
      console.log(`❌ Admin route denied for ${user.role}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    console.log('✅ Admin route - access granted')
  }
  
  if (matchesRoute(pathname, MANAGER_PLUS_ROUTES)) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      console.log(`❌ Manager+ route denied for ${user.role}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    console.log('✅ Manager+ route - access granted')
  }
  
  console.log('🚀 Request allowed - proceeding')
  return response
}