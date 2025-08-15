import { db } from './db'
import { createClient } from '@/utils/supabase/server'
import { UserRole } from '@prisma/client'

// Supabase Auth integration
export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      return null
    }

    if (!user) {
      console.log('No authenticated user found')
      return null
    }

    console.log('Found authenticated user:', user.email)

    // Get user from our database using email
    const dbUser = await db.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      // If user doesn't exist in our DB, create them
      const newUser = await db.user.create({
        data: {
          clerkId: user.id, // Using Supabase user ID
          email: user.email!,
          firstName: user.user_metadata?.first_name || 'Demo',
          lastName: user.user_metadata?.last_name || 'Admin',
          role: 'ADMIN', // Demo user gets admin role
          isActive: true
        }
      })
      return newUser
    }

    return dbUser
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
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

// Auth utilities for Supabase integration
export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}