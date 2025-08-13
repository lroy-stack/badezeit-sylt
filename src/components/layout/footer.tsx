import Link from "next/link"
import { Waves, Phone, MapPin, Clock, Mail, Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  language?: 'de' | 'en'
}

export function Footer({ language = 'de' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    restaurant: {
      title: language === 'en' ? 'Restaurant' : 'Restaurant',
      links: [
        { name: language === 'en' ? 'Menu' : 'Speisekarte', href: '/speisekarte' },
        { name: language === 'en' ? 'Reservations' : 'Reservierung', href: '/reservierung' },
        { name: language === 'en' ? 'Gallery' : 'Galerie', href: '/galerie' },
        { name: language === 'en' ? 'News' : 'Aktuelles', href: '/aktuelles' },
      ]
    },
    information: {
      title: language === 'en' ? 'Information' : 'Information',
      links: [
        { name: language === 'en' ? 'About Us' : 'Über uns', href: '/ueber-uns' },
        { name: language === 'en' ? 'Contact' : 'Kontakt', href: '/kontakt' },
        { name: language === 'en' ? 'Reviews' : 'Bewertungen', href: '/bewertungen' },
        { name: language === 'en' ? 'Events' : 'Veranstaltungen', href: '/veranstaltungen' },
      ]
    },
    legal: {
      title: language === 'en' ? 'Legal' : 'Rechtliches',
      links: [
        { name: language === 'en' ? 'Imprint' : 'Impressum', href: '/impressum' },
        { name: language === 'en' ? 'Privacy Policy' : 'Datenschutz', href: '/datenschutz' },
        { name: language === 'en' ? 'Terms & Conditions' : 'AGB', href: '/agb' },
        { name: language === 'en' ? 'Cookie Policy' : 'Cookie-Richtlinie', href: '/cookies' },
      ]
    },
  }

  return (
    <footer className="bg-card border-t">
      {/* Newsletter Section */}
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              {language === 'en' 
                ? 'Stay Updated with Our Newsletter' 
                : 'Bleiben Sie mit unserem Newsletter auf dem Laufenden'
              }
            </h3>
            <p className="text-white/80 mb-6">
              {language === 'en'
                ? 'Get the latest news about our seasonal menus, special events, and exclusive offers.'
                : 'Erhalten Sie die neuesten Nachrichten über unsere Saisonmenüs, besondere Veranstaltungen und exklusive Angebote.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={language === 'en' ? 'Your email address' : 'Ihre E-Mail-Adresse'}
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
              />
              <Button variant="outline" className="bg-background text-primary hover:bg-background/90">
                {language === 'en' ? 'Subscribe' : 'Anmelden'}
              </Button>
            </div>
            <p className="text-xs text-white/60 mt-3">
              {language === 'en'
                ? 'You can unsubscribe at any time. We respect your privacy.'
                : 'Sie können sich jederzeit abmelden. Wir respektieren Ihre Privatsphäre.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Waves className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Badezeit Sylt</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              {language === 'en'
                ? 'Exquisite North German cuisine with spectacular ocean views in the heart of Kampen on Sylt.'
                : 'Exquisite norddeutsche Küche mit spektakulärem Meerblick im Herzen von Kampen auf Sylt.'
              }
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">Badezeit Sylt</div>
                  <div className="text-muted-foreground">
                    Strandweg 1<br />
                    25999 Kampen/Sylt
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <Link 
                    href="tel:+4946511123456" 
                    className="hover:text-primary transition-colors"
                  >
                    +49 4651 123456
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <Link 
                    href="mailto:info@badezeit-sylt.de" 
                    className="hover:text-primary transition-colors"
                  >
                    info@badezeit-sylt.de
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="font-medium">
                    {language === 'en' ? 'Opening Hours' : 'Öffnungszeiten'}
                  </div>
                  <div className="text-muted-foreground">
                    {language === 'en' ? 'Mon-Sun: 12:00-22:00' : 'Mo-So: 12:00-22:00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {currentYear} Badezeit Sylt. {language === 'en' ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="https://instagram.com/badezeit.sylt" 
                className="text-muted-foreground hover:text-ocean transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link 
                href="https://facebook.com/badezeit.sylt" 
                className="text-muted-foreground hover:text-ocean transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}