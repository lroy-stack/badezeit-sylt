import { NextRequest, NextResponse } from 'next/server'

export interface MiddlewareFunction {
  (request: NextRequest): Promise<NextResponse> | NextResponse
}

export interface RouteConfig {
  matcher: string[]
}

export interface AuthContext {
  userId: string | null
  role: string | null
  isAuthenticated: boolean
}

export interface DevUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN'
}

// Development authentication configuration
export const DEV_USERS: Record<string, DevUser> = {
  'demo-admin': {
    id: 'demo-admin-id',
    email: 'admin@badezeit.de',
    firstName: 'Demo',
    lastName: 'Admin',
    role: 'ADMIN'
  },
  'demo-manager': {
    id: 'demo-manager-id', 
    email: 'manager@badezeit.de',
    firstName: 'Demo',
    lastName: 'Manager',
    role: 'MANAGER'
  },
  'demo-staff': {
    id: 'demo-staff-id',
    email: 'staff@badezeit.de',
    firstName: 'Demo', 
    lastName: 'Staff',
    role: 'STAFF'
  }
}

// Route matchers
export const PROTECTED_ROUTES = [
  '/dashboard(.*)',
  '/api/admin(.*)',
  '/admin(.*)'
]

export const ADMIN_ONLY_ROUTES = [
  '/dashboard/einstellungen(.*)',
  '/dashboard/analytics(.*)', 
  '/api/admin(.*)'
]

export const MANAGER_PLUS_ROUTES = [
  '/dashboard/analytics(.*)',
  '/dashboard/kunden/export(.*)'
]