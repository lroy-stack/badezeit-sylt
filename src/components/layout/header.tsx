'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Waves, Menu, Phone, Clock, MapPin, Calendar, ChefHat, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: 'Speisekarte',
    nameEn: 'Menu',
    href: '/speisekarte',
    description: 'Unsere kulinarischen Kreationen',
    descriptionEn: 'Our culinary creations',
    icon: ChefHat,
  },
  {
    name: 'Reservierung',
    nameEn: 'Reservations', 
    href: '/reservierung',
    description: 'Tisch online reservieren',
    descriptionEn: 'Reserve your table online',
    icon: Calendar,
  },
  {
    name: 'Galerie',
    nameEn: 'Gallery',
    href: '/galerie', 
    description: 'Impressionen aus unserem Restaurant',
    descriptionEn: 'Impressions from our restaurant',
    icon: Camera,
  },
  {
    name: 'Über uns',
    nameEn: 'About',
    href: '/ueber-uns',
    description: 'Unsere Geschichte und Philosophie', 
    descriptionEn: 'Our story and philosophy',
    icon: Waves,
  },
  {
    name: 'Kontakt',
    nameEn: 'Contact',
    href: '/kontakt',
    description: 'Anfahrt und Öffnungszeiten',
    descriptionEn: 'Directions and opening hours', 
    icon: MapPin,
  },
]

interface HeaderProps {
  variant?: 'default' | 'transparent'
  language?: 'de' | 'en'
}

export function Header({ variant = 'default', language = 'de' }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={cn(
      "z-50 w-full border-b",
      variant === 'transparent' 
        ? "absolute top-0 bg-transparent backdrop-blur-md border-white/20 shadow-lg" 
        : "sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container h-16">
        <div className="flex items-center justify-between h-full px-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Waves className={cn(
                "h-8 w-8",
                variant === 'transparent' ? "text-white" : "text-primary"
              )} />
              <span className={cn(
                "font-bold text-xl",
                variant === 'transparent' ? "text-white" : "text-foreground"
              )}>
                <span className="hidden sm:inline">Badezeit Sylt</span>
                <span className="sm:hidden">Badezeit</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground/80 whitespace-nowrap",
                    pathname === item.href 
                      ? "text-foreground" 
                      : variant === 'transparent' 
                        ? "text-white/80 hover:text-white" 
                        : "text-foreground/60 hover:text-foreground/80"
                  )}
                >
                  {language === 'en' ? item.nameEn : item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center">
            <Button 
              asChild
              variant={variant === 'transparent' ? 'outline' : 'default'}
              className={variant === 'transparent' ? 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-blue-900 shadow-lg transition-all duration-200' : ''}
            >
              <Link href="/reservierung">
                <Calendar className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Reserve Table' : 'Tisch reservieren'}
              </Link>
            </Button>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-11 w-11 min-h-[44px] min-w-[44px]",
                    variant === 'transparent' ? "text-white hover:bg-white/20" : ""
                  )}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">            
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center space-x-2">
                    <Waves className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Badezeit Sylt</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg transition-colors min-h-[44px]",
                        pathname === item.href 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      <div>
                        <div className="font-medium">
                          {language === 'en' ? item.nameEn : item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'en' ? item.descriptionEn : item.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full h-12 min-h-[48px]" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/reservierung">
                      <Calendar className="mr-2 h-5 w-5" />
                      {language === 'en' ? 'Reserve Table' : 'Tisch reservieren'}
                    </Link>
                  </Button>

                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      <span>+49 4651 834020</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <span>Wiedereröffnung 2025</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <span>Dünenstraße 3, Westerland/Sylt</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}