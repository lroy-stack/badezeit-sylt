import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Simple auth check without Supabase realtime dependencies 
  // This avoids Edge Runtime compatibility issues
  const pathname = request.nextUrl.pathname
  
  // Allow public routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }
  
  // For dashboard routes, redirect to login if no auth
  // This is a simplified version - full auth is handled by page components
  const authCookie = request.cookies.get('sb-ayugwprhixtsfktxungq-auth-token')
  
  if (!authCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}