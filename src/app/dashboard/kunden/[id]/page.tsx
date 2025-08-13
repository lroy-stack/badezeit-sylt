import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  ArrowLeft,
  User,
  Star,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Shield,
  TrendingUp,
  Clock,
  Users,
  Table,
  MessageSquare,
  Edit,
  Download,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { CustomerActions } from './components/customer-actions'
import { CustomerNotes } from './components/customer-notes'
import { ReservationHistory } from './components/reservation-history'
import { CustomerStats } from './components/customer-stats'

interface CustomerProfilePageProps {
  params: Promise<{
    id: string
  }>
}

async function getCustomer(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      reservations: {
        include: {
          table: {
            select: {
              id: true,
              number: true,
              capacity: true,
              location: true
            }
          }
        },
        orderBy: {
          dateTime: 'desc'
        }
      },
      notes: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          reservations: true
        }
      }
    }
  })

  return customer
}

async function getCustomerStatistics(customerId: string) {
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const [
    totalReservations,
    completedReservations,
    cancelledReservations,
    noShows,
    recentReservations,
    upcomingReservations,
    averagePartySize,
    favoriteTimeSlots
  ] = await Promise.all([
    db.reservation.count({
      where: { customerId }
    }),
    db.reservation.count({
      where: { customerId, status: 'COMPLETED' }
    }),
    db.reservation.count({
      where: { customerId, status: 'CANCELLED' }
    }),
    db.reservation.count({
      where: { customerId, status: 'NO_SHOW' }
    }),
    db.reservation.count({
      where: { 
        customerId,
        createdAt: { gte: oneMonthAgo }
      }
    }),
    db.reservation.count({
      where: { 
        customerId,
        dateTime: { gte: now },
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    }),
    db.reservation.aggregate({
      where: { customerId, status: 'COMPLETED' },
      _avg: { partySize: true }
    }),
    db.reservation.groupBy({
      by: ['dateTime'],
      where: { customerId, status: 'COMPLETED' },
      _count: true,
      orderBy: { _count: { dateTime: 'desc' } },
      take: 5
    })
  ])

  // Calculate favorite time slots (hour of day)
  const timeSlotCounts: { [key: string]: number } = {}
  const reservationsWithTimes = await db.reservation.findMany({
    where: { customerId, status: 'COMPLETED' },
    select: { dateTime: true }
  })

  reservationsWithTimes.forEach(res => {
    const hour = new Date(res.dateTime).getHours()
    const timeSlot = `${hour}:00`
    timeSlotCounts[timeSlot] = (timeSlotCounts[timeSlot] || 0) + 1
  })

  const sortedTimeSlots = Object.entries(timeSlotCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return {
    totalReservations,
    completedReservations,
    cancelledReservations,
    noShows,
    recentReservations,
    upcomingReservations,
    averagePartySize: averagePartySize._avg.partySize || 0,
    favoriteTimeSlots: sortedTimeSlots,
    completionRate: totalReservations > 0 ? Math.round((completedReservations / totalReservations) * 100) : 0,
    cancellationRate: totalReservations > 0 ? Math.round((cancelledReservations / totalReservations) * 100) : 0
  }
}

function CustomerHeader({ customer }: { customer: any }) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full border shadow-sm">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h2>
                {customer.isVip && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Star className="h-3 w-3 mr-1" />
                    VIP Kunde
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${customer.email}`} className="hover:underline">
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>{customer.language === 'DE' ? 'Deutsch' : 'English'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Kunde seit {format(customer.createdAt, 'dd.MM.yyyy', { locale: de })}</span>
                </div>
                {customer.lastVisit && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Letzter Besuch: {format(customer.lastVisit, 'dd.MM.yyyy', { locale: de })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/reservierungen/neu?customerId=${customer.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Reservierung
              </Link>
            </Button>
            <CustomerActions customer={customer} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomerInfo({ customer }: { customer: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persönliche Daten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Vollständiger Name</p>
            <p className="text-sm text-gray-600">{customer.firstName} {customer.lastName}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">E-Mail-Adresse</p>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
          
          {customer.phone && (
            <div>
              <p className="text-sm font-medium text-gray-900">Telefonnummer</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
            </div>
          )}
          
          {customer.dateOfBirth && (
            <div>
              <p className="text-sm font-medium text-gray-900">Geburtsdatum</p>
              <p className="text-sm text-gray-600">
                {format(customer.dateOfBirth, 'dd.MM.yyyy', { locale: de })}
              </p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900">Sprache</p>
            <p className="text-sm text-gray-600">
              {customer.language === 'DE' ? 'Deutsch' : 'English'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Präferenzen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.preferredTime && (
            <div>
              <p className="text-sm font-medium text-gray-900">Bevorzugte Zeit</p>
              <p className="text-sm text-gray-600">{customer.preferredTime}</p>
            </div>
          )}
          
          {customer.preferredLocation && (
            <div>
              <p className="text-sm font-medium text-gray-900">Bevorzugter Bereich</p>
              <p className="text-sm text-gray-600">
                {customer.preferredLocation === 'TERRACE' ? 'Terrasse' :
                 customer.preferredLocation === 'INDOOR' ? 'Innenbereich' :
                 customer.preferredLocation === 'BAR' ? 'Bar' :
                 customer.preferredLocation === 'PRIVATE' ? 'Separé' : customer.preferredLocation}
              </p>
            </div>
          )}
          
          {customer.dietaryRestrictions && customer.dietaryRestrictions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900">Diätanforderungen</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.dietaryRestrictions.map((restriction: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {customer.allergies && (
            <div>
              <p className="text-sm font-medium text-gray-900">Allergien</p>
              <p className="text-sm text-gray-600 bg-orange-50 p-2 rounded border-l-4 border-orange-200">
                {customer.allergies}
              </p>
            </div>
          )}
          
          {customer.favoriteDisheIds && customer.favoriteDisheIds.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900">Lieblingsgerichte</p>
              <p className="text-sm text-gray-600">{customer.favoriteDisheIds.length} gespeichert</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GDPRStatus({ customer }: { customer: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Datenschutz & GDPR Compliance
        </CardTitle>
        <CardDescription>
          Übersicht der Einverständniserklärungen und Datenschutzeinstellungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Datenverarbeitung</p>
              {customer.dataProcessingConsent ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {customer.dataProcessingConsent ? 'Zugestimmt' : 'Nicht zugestimmt'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">E-Mail-Kommunikation</p>
              {customer.emailConsent ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {customer.emailConsent ? 'Erlaubt' : 'Nicht erlaubt'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Marketing</p>
              {customer.marketingConsent ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {customer.marketingConsent ? 'Einverstanden' : 'Abgelehnt'}
            </p>
          </div>
        </div>
        
        {customer.consentDate && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Einverständnisse erteilt am: {' '}
              <span className="font-medium">
                {format(customer.consentDate, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
              </span>
            </p>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Daten exportieren
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Einverständnisse verwalten
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const resolvedParams = await params
  
  const [customer, statistics] = await Promise.all([
    getCustomer(resolvedParams.id),
    getCustomerStatistics(resolvedParams.id)
  ])
  
  if (!customer) {
    notFound()
  }
  
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/kunden">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kundenprofil</h1>
            <p className="text-muted-foreground">
              Detaillierte Kundeninformationen und Reservierungshistorie
            </p>
          </div>
        </div>
      </div>

      {/* Customer Header */}
      <CustomerHeader customer={customer} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="reservations">Reservierungen</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CustomerInfo customer={customer} />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reservierungen gesamt</p>
                    <p className="text-2xl font-bold">{statistics.totalReservations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Abgeschlossen</p>
                    <p className="text-2xl font-bold">{statistics.completedReservations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ø Gruppengröße</p>
                    <p className="text-2xl font-bold">{statistics.averagePartySize.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Erfolgsrate</p>
                    <p className="text-2xl font-bold">{statistics.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reservations">
          <Suspense fallback={<div>Reservierungen werden geladen...</div>}>
            <ReservationHistory reservations={customer.reservations} />
          </Suspense>
        </TabsContent>

        <TabsContent value="notes">
          <Suspense fallback={<div>Notizen werden geladen...</div>}>
            <CustomerNotes 
              customerId={customer.id} 
              notes={customer.notes}
              userRole={user.role}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="statistics">
          <Suspense fallback={<div>Statistiken werden geladen...</div>}>
            <CustomerStats customer={customer} statistics={statistics} />
          </Suspense>
        </TabsContent>

        <TabsContent value="gdpr">
          <GDPRStatus customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  )
}