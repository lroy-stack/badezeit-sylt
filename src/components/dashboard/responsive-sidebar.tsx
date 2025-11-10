"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Table,
  Menu,
  BarChart3,
  Settings,
  Building2,
  Bell,
  Mail,
  Shield,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  MenuIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CollapsibleNavItem } from "@/components/collapsible-nav-item"
import { LogoutButton } from "@/components/auth/logout-button"

interface SubItem {
  name: string
  href: string
  icon?: any
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  roles: string[]
  subItems?: SubItem[]
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
    roles: ['ADMIN'],
    subItems: [
      {
        name: 'Allgemein',
        href: '/dashboard/einstellungen?section=general',
        icon: Settings
      },
      {
        name: 'Branding',
        href: '/dashboard/einstellungen?section=branding',
        icon: Building2
      },
      {
        name: 'Benachrichtigungen',
        href: '/dashboard/einstellungen?section=notifications',
        icon: Bell
      },
      {
        name: 'System',
        href: '/dashboard/einstellungen?section=system',
        icon: Shield
      }
    ]
  }
]

interface ResponsiveSidebarProps {
  user: {
    firstName: string | null
    lastName: string | null
    role: string
    email?: string
  }
}

export function ResponsiveSidebar({ user }: ResponsiveSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const pathname = usePathname()

  // Filtrar navegación según rol
  const allowedNavigation = navigationItems.filter(item =>
    item.roles.includes(user.role)
  )

  // Cerrar menú móvil cuando cambia la ruta
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Contenido del sidebar
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "border-b p-6 flex items-center",
        isCollapsed && !isMobile ? "justify-center p-4" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h2 className="font-bold text-lg">Badezeit Sylt</h2>
              <p className="text-xs text-muted-foreground">Verwaltung</p>
            </div>
          )}
        </div>

        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {allowedNavigation.map((item) => {
            if (item.subItems && item.subItems.length > 0) {
              return (
                <CollapsibleNavItem
                  key={item.href}
                  name={item.name}
                  href={item.href}
                  icon={item.icon}
                  subItems={item.subItems}
                  roles={item.roles}
                />
              )
            }

            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full gap-3 h-11 font-normal",
                      isCollapsed && !isMobile ? "justify-center px-0" : "justify-start"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className={cn(
          "flex items-center gap-3 mb-3",
          isCollapsed && !isMobile && "justify-center"
        )}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName || 'Usuario'} {user.lastName || ''}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role}
              </p>
            </div>
          )}
        </div>

        <LogoutButton
          className={cn(
            "w-full gap-3 h-10 font-normal",
            isCollapsed && !isMobile ? "justify-center px-0" : "justify-start"
          )}
          variant="outline"
          showText={!isCollapsed || isMobile}
        />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r z-50 lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r bg-card relative"
      >
        <SidebarContent />

        {/* Collapse Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </motion.aside>
    </>
  )
}
