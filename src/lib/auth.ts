import { db } from './db'
import { UserRole } from '@prisma/client'

// Check if we're in development mode without proper Clerk configuration
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' && 
    (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') ||
     !process.env.CLERK_SECRET_KEY?.startsWith('sk_') ||
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_clerk_publishable_key_here') ||
     process.env.CLERK_SECRET_KEY?.includes('your_clerk_secret_key_here'))
}

// Demo user for development
const DEMO_USER = {
  id: 'demo-user-id',
  clerkId: 'demo-clerk-id',
  email: 'demo@badezeit.de',
  firstName: 'Demo',
  lastName: 'Admin',
  role: 'ADMIN' as UserRole,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

export async function getCurrentUser() {
  // Always return demo user in development mode or during build time
  // This prevents any Clerk imports during static generation
  if (isDevelopmentMode()) {
    console.log('🔥 Development mode: Using demo user (auth.ts)')
    return DEMO_USER
  }

  // Only attempt Clerk auth in production with proper configuration
  try {
    // Dynamically import auth from Clerk only when needed
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()
    
    if (!userId) return null

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    return user
  } catch (error) {
    console.error('Auth error:', error)
    // Always fallback to demo user on any error
    console.log('🔧 Auth failed, using demo user')
    return DEMO_USER
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    // In development mode, this should not happen due to demo user
    if (isDevelopmentMode()) {
      console.log('🔧 Development mode: Auth required but no user, returning demo user')
      return DEMO_USER
    }
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    // In development mode with demo admin user, allow all roles
    if (isDevelopmentMode() && user.id === DEMO_USER.id) {
      console.log('🔧 Development mode: Demo admin user bypassing role check')
      return user
    }
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

export async function isManagerOrAbove() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN' || user?.role === 'MANAGER'
}

export async function canAccessDashboard() {
  const user = await getCurrentUser()
  return user !== null
}

// Utility to sync Clerk user with our database
export async function syncUserWithDatabase(clerkUserId: string, userData: {
  email: string
  firstName?: string | null
  lastName?: string | null
}) {
  // Skip sync in development mode
  if (isDevelopmentMode()) {
    console.log('🔧 Development mode: Skipping user sync')
    return DEMO_USER
  }

  const existingUser = await db.user.findUnique({
    where: { clerkId: clerkUserId }
  })

  if (existingUser) {
    // Update existing user
    return await db.user.update({
      where: { clerkId: clerkUserId },
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }
    })
  } else {
    // Create new user with default STAFF role
    return await db.user.create({
      data: {
        clerkId: clerkUserId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'STAFF', // Default role
      }
    })
  }
}