import { auth } from '@clerk/nextjs/server'
import { db } from './db'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
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