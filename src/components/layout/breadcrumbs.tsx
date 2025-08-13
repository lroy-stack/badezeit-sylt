import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  language?: 'de' | 'en'
}

export function Breadcrumbs({ 
  items, 
  className, 
  showHome = true, 
  language = 'de' 
}: BreadcrumbsProps) {
  const homeLabel = language === 'en' ? 'Home' : 'Startseite'

  const allItems = showHome 
    ? [{ label: homeLabel, href: '/' }, ...items]
    : items

  return (
    <nav 
      className={cn("flex items-center space-x-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
            )}
            
            {item.current || !item.href ? (
              <span 
                className={cn(
                  "font-medium",
                  item.current 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {index === 0 && showHome ? (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    {item.label}
                  </div>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 && showHome ? (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    {item.label}
                  </div>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Utility function to generate breadcrumbs from pathname
export function generateBreadcrumbs(
  pathname: string, 
  language: 'de' | 'en' = 'de'
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Define path-to-label mappings
  const pathLabels = {
    de: {
      'speisekarte': 'Speisekarte',
      'reservierung': 'Reservierung',
      'galerie': 'Galerie',
      'ueber-uns': 'Über uns',
      'kontakt': 'Kontakt',
      'dashboard': 'Dashboard',
      'reservierungen': 'Reservierungen',
      'kunden': 'Kunden',
      'tische': 'Tische',
      'analytics': 'Analytics',
      'einstellungen': 'Einstellungen',
      'qr-codes': 'QR-Codes',
      'impressum': 'Impressum',
      'datenschutz': 'Datenschutz',
      'agb': 'AGB',
      'bewertungen': 'Bewertungen',
      'aktuelles': 'Aktuelles',
      'veranstaltungen': 'Veranstaltungen',
    },
    en: {
      'speisekarte': 'Menu',
      'reservierung': 'Reservations', 
      'galerie': 'Gallery',
      'ueber-uns': 'About Us',
      'kontakt': 'Contact',
      'dashboard': 'Dashboard',
      'reservierungen': 'Reservations',
      'kunden': 'Customers',
      'tische': 'Tables',
      'analytics': 'Analytics',
      'einstellungen': 'Settings',
      'qr-codes': 'QR Codes',
      'impressum': 'Imprint',
      'datenschutz': 'Privacy Policy',
      'agb': 'Terms & Conditions',
      'bewertungen': 'Reviews',
      'aktuelles': 'News',
      'veranstaltungen': 'Events',
    }
  }

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Get label for segment
    const label = pathLabels[language][segment as keyof typeof pathLabels['de']] || 
                   segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast,
    })
  })

  return breadcrumbs
}