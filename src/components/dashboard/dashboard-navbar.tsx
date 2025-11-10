"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { cn } from "@/lib/utils"

interface DashboardNavbarProps {
  userRole: string
}

// Mapeo de rutas a títulos en alemán
const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/reservierungen': 'Reservierungen',
  '/dashboard/kunden': 'Kunden',
  '/dashboard/tische': 'Tische',
  '/dashboard/speisekarte': 'Speisekarte',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/einstellungen': 'Einstellungen',
}

// Mapeo de secciones de einstellungen
const settingsSections: Record<string, string> = {
  'general': 'Allgemein',
  'branding': 'Branding',
  'notifications': 'Benachrichtigungen',
  'system': 'System',
  'business': 'Geschäftsdaten',
  'staff': 'Mitarbeiter',
  'email': 'E-Mail',
  'security': 'Sicherheit',
  'integrations': 'Integrationen',
}

export function DashboardNavbar({ userRole }: DashboardNavbarProps) {
  const pathname = usePathname()

  // Generar breadcrumbs
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href: string }[] = []

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Obtener título del segmento
      let label = routeTitles[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)

      // Si es un ID (número o cuid), mostrar como "Detalles"
      if (/^[0-9a-z-]+$/i.test(segment) && segment.length > 10) {
        label = 'Detalles'
      }

      breadcrumbs.push({
        label,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Obtener título de la página actual
  const getCurrentPageTitle = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const section = searchParams.get('section')

    if (section && pathname.includes('einstellungen')) {
      return `${routeTitles[pathname]} / ${settingsSections[section] || section}`
    }

    return breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'
  }

  const [pageTitle, setPageTitle] = React.useState(getCurrentPageTitle())

  React.useEffect(() => {
    setPageTitle(getCurrentPageTitle())
  }, [pathname])

  return (
    <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Breadcrumbs */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Spacer for mobile */}
        <div className="lg:hidden w-16" />

        {/* Search/Command Menu */}
        <div className="flex-shrink-0">
          <CommandMenu userRole={userRole} />
        </div>
      </div>
    </div>
  )
}
