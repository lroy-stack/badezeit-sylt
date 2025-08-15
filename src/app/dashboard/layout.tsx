import { ReactNode, Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Table,
  Menu,
  BarChart3,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogoutButton } from '@/components/auth/logout-button'


interface DashboardLayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  roles: string[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']
  },
  {
    name: 'Reservierungen',
    href: '/dashboard/reservierungen',
    icon: Calendar,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Kunden',
    href: '/dashboard/kunden',
    icon: Users,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Tische',
    href: '/dashboard/tische',
    icon: Table,
    roles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Speisekarte',
    href: '/dashboard/speisekarte',
    icon: Menu,
    roles: ['ADMIN', 'MANAGER', 'KITCHEN']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER']
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/einstellungen',
    icon: Settings,
    roles: ['ADMIN']
  }
]

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r bg-card">
        <div className="p-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="px-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Check authentication first
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Filter navigation items based on user role
  const allowedNavigation = navigationItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Badezeit</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {allowedNavigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10 font-normal"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            {/* User avatar */}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <LogoutButton 
            className="w-full justify-start gap-3 h-10 font-normal" 
            variant="ghost"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<DashboardSkeleton />}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
