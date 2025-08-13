import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Globe,
  Shield,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  language: string
  isVip: boolean
  totalVisits: number
  totalSpent: number | { toNumber: () => number }  // Support Prisma Decimal
  averagePartySize: number
  lastVisit: Date | null
  emailConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  consentDate: Date | null
  notes: Array<{
    id: string
    note: string
    isImportant: boolean
    createdAt: Date
    user: {
      firstName: string | null
      lastName: string | null
    }
  }>
  reservations: Array<{
    id: string
    dateTime: Date
    status: string
    partySize: number
  }>
}

interface CustomerInfoProps {
  customer: Customer
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  const recentReservations = customer.reservations.slice(0, 3)
  const completedReservations = customer.reservations.filter(r => r.status === 'COMPLETED').length
  const importantNotes = customer.notes.filter(n => n.isImportant)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kundeninformationen
          </div>
          <div className="flex items-center gap-2">
            {customer.isVip && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/kunden/${customer.id}`}>
                Profil anzeigen
              </Link>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Kontaktdaten</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <a 
                  href={`mailto:${customer.email}`} 
                  className="text-blue-600 hover:underline"
                >
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <a 
                    href={`tel:${customer.phone}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span>{customer.language === 'DE' ? 'Deutsch' : 'English'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Statistiken</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gesamtbesuche:</span>
                <span className="font-medium">{customer.totalVisits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gesamtumsatz:</span>
                <span className="font-medium">€{typeof customer.totalSpent === 'number' ? customer.totalSpent.toFixed(2) : customer.totalSpent.toNumber().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ø Gruppengröße:</span>
                <span className="font-medium">{customer.averagePartySize} Personen</span>
              </div>
              {customer.lastVisit && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Letzter Besuch:</span>
                  <span className="font-medium">
                    {format(customer.lastVisit, 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* GDPR Consent Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Datenschutz & Einverständnisse
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Datenverarbeitung:</span>
              <Badge variant={customer.dataProcessingConsent ? "default" : "destructive"}>
                {customer.dataProcessingConsent ? 'Zugestimmt' : 'Nicht zugestimmt'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>E-Mail-Kontakt:</span>
              <Badge variant={customer.emailConsent ? "default" : "secondary"}>
                {customer.emailConsent ? 'Ja' : 'Nein'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Marketing:</span>
              <Badge variant={customer.marketingConsent ? "default" : "secondary"}>
                {customer.marketingConsent ? 'Ja' : 'Nein'}
              </Badge>
            </div>
          </div>
          {customer.consentDate && (
            <p className="text-xs text-muted-foreground">
              Einverständnisse erteilt am: {' '}
              {format(customer.consentDate, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
            </p>
          )}
        </div>
        
        <Separator />
        
        {/* Important Notes */}
        {importantNotes.length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Wichtige Notizen ({importantNotes.length})
              </h4>
              <div className="space-y-2">
                {importantNotes.map((note) => (
                  <div key={note.id} className="bg-orange-50 border-l-4 border-orange-200 p-3 rounded">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.user.firstName} {note.user.lastName} • {' '}
                      {format(note.createdAt, 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}
        
        {/* Recent Reservations */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Letzte Reservierungen
          </h4>
          {recentReservations.length > 0 ? (
            <div className="space-y-2">
              {recentReservations.map((reservation) => {
                const statusConfig = {
                  PENDING: { label: 'Wartend', variant: 'secondary' as const },
                  CONFIRMED: { label: 'Bestätigt', variant: 'default' as const },
                  SEATED: { label: 'Eingecheckt', variant: 'default' as const },
                  COMPLETED: { label: 'Abgeschlossen', variant: 'outline' as const },
                  CANCELLED: { label: 'Storniert', variant: 'destructive' as const },
                  NO_SHOW: { label: 'No-Show', variant: 'destructive' as const }
                }
                
                const config = statusConfig[reservation.status as keyof typeof statusConfig] || statusConfig.PENDING
                
                return (
                  <div key={reservation.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <div>
                      <p className="font-medium">
                        {format(reservation.dateTime, 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {reservation.partySize} Personen
                      </p>
                    </div>
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                )
              })}
              
              {customer.reservations.length > 3 && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/kunden/${customer.id}`}>
                    Alle {customer.reservations.length} Reservierungen anzeigen
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine vorherigen Reservierungen</p>
          )}
        </div>
        
        {/* Customer Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Kundenwert
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Basierend auf Besuchen, Umsatz und Loyalität
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.min(100, Math.round((completedReservations * 20) + ((typeof customer.totalSpent === 'number' ? customer.totalSpent : customer.totalSpent.toNumber()) / 10)))}
              </div>
              <p className="text-xs text-muted-foreground">von 100</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
