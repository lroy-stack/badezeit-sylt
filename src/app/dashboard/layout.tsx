import { ReactNode, Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ResponsiveSidebar } from '@/components/dashboard/responsive-sidebar'
import { DashboardNavbar } from '@/components/dashboard/dashboard-navbar'

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Responsive Sidebar */}
      <ResponsiveSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar userRole={user.role} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<DashboardSkeleton />}>
            <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
              {children}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
