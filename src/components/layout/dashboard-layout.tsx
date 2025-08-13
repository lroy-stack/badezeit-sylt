'use client'

import { ReactNode, useState } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Waves, 
  Menu, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ChefHat, 
  Utensils,
  BarChart3,
  QrCode,
  Settings,
  Bell,
  Home,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: 'Übersicht',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard und Statistiken'
  },
  {
    name: 'Reservierungen',
    href: '/dashboard/reservierungen', 
    icon: Calendar,
    description: 'Tischreservierungen verwalten'
  },
  {
    name: 'Kunden',
    href: '/dashboard/kunden',
    icon: Users,
    description: 'Kundenverwaltung und CRM'
  },
  {
    name: 'Tische',
    href: '/dashboard/tische',
    icon: Utensils,
    description: 'Tischlayout und Verwaltung'
  },
  {
    name: 'Speisekarte',
    href: '/dashboard/speisekarte',
    icon: ChefHat,
    description: 'Menü und Gerichte verwalten'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Berichte und Auswertungen'
  },
  {
    name: 'QR-Codes',
    href: '/dashboard/qr-codes',
    icon: QrCode,
    description: 'QR-Code Verwaltung'
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/einstellungen',
    icon: Settings,
    description: 'System-Einstellungen'
  },
]

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 ring-1 ring-gray-900/5">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Badezeit Sylt</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button size="sm" className="w-full justify-start" asChild>
              <Link href="/" target="_blank">
                <Home className="mr-2 h-4 w-4" />
                Website besuchen
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Benachrichtigungen
              <Badge className="ml-auto">3</Badge>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary',
                            'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-colors'
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-primary',
                              'h-5 w-5 shrink-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className={cn(
                              "text-xs",
                              isActive ? 'text-white/80' : 'text-gray-500'
                            )}>
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-sm p-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Waves className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Dashboard</span>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-white' : 'text-gray-400',
                        'h-5 w-5 shrink-0'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 pt-6 border-t">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/" target="_blank">
                  <Home className="mr-2 h-4 w-4" />
                  Website besuchen
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div>
                {title && (
                  <h1 className="text-xl font-semibold leading-6 text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {actions && (
                <div className="hidden sm:flex items-center gap-2">
                  {actions}
                </div>
              )}
              
              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
                <Badge className="ml-1 h-2 w-2 rounded-full p-0 bg-red-500"></Badge>
              </Button>

              {/* Profile dropdown */}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}