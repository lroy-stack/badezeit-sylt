import { NextRequest, NextResponse } from 'next/server'

// Check if Clerk is properly configured
function isClerkConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
    process.env.CLERK_SECRET_KEY?.startsWith('sk_') &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_clerk_publishable_key_here') &&
    !process.env.CLERK_SECRET_KEY?.includes('your_clerk_secret_key_here')
  )
}

// Since we're in development mode (no valid Clerk keys), use development middleware directly
import devMiddleware from './middleware/dev'

export default async function middleware(request: NextRequest) {
  // For now, always use development mode since Clerk is not configured
  // When Clerk is properly configured, this can be switched to production mode
  
  const clerkConfigured = isClerkConfigured()
  
  console.log('🔀 MIDDLEWARE: Environment detection')
  console.log(`📊 Clerk configured: ${clerkConfigured}`)
  console.log(`🛠️ Mode: DEVELOPMENT (using dev middleware)`)
  
  // Always use development middleware for now to avoid Clerk import issues
  return devMiddleware(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}