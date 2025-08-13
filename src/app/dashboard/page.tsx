import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  Calendar,
  Users,
  Table,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface DashboardMetrics {
  heute: {
    reservierungen: { gesamt: number; bestaetigt: number; wartend: number }
    auslastung: { aktuell: number; durchschnitt: number }
    kunden: { neue: number; wiederkehrend: number; vip: number }
  }
  trends: { reservierungenVsGestern: number; kundenVsGestern: number }
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const heute = new Date()
  const heuteStart = startOfDay(heute)
  const heuteEnd = endOfDay(heute)
  const gestern = subDays(heute, 1)
  const gesternStart = startOfDay(gestern)
  const gesternEnd = endOfDay(gestern)

  // Get today's reservations
  const [totalReservationsHeute, confirmedReservationsHeute, pendingReservationsHeute] = await Promise.all([
    db.reservation.count({ 
      where: { 
        dateTime: { gte: heuteStart, lte: heuteEnd } 
      } 
    }),
    db.reservation.count({ 
      where: { 
        dateTime: { gte: heuteStart, lte: heuteEnd },
        status: 'CONFIRMED'
      } 
    }),
    db.reservation.count({ 
      where: { 
        dateTime: { gte: heuteStart, lte: heuteEnd },
        status: 'PENDING'
      } 
    })
  ])

  // Get yesterday's reservations for comparison
  const totalReservationsGestern = await db.reservation.count({ 
    where: { 
      dateTime: { gte: gesternStart, lte: gesternEnd } 
    } 
  })

  // Get customer metrics
  const [neueKundenHeute, gesamtKundenHeute, vipKunden] = await Promise.all([
    db.customer.count({ 
      where: { 
        createdAt: { gte: heuteStart, lte: heuteEnd } 
      } 
    }),
    db.customer.count(),
    db.customer.count({ 
      where: { isVip: true } 
    })
  ])

  const neueKundenGestern = await db.customer.count({ 
    where: { 
      createdAt: { gte: gesternStart, lte: gesternEnd } 
    } 
  })

  // Calculate occupancy (simplified)
  const totalTables = await db.table.count({ where: { isActive: true } })
  const occupiedTables = await db.reservation.count({
    where: {
      dateTime: { gte: heuteStart, lte: heuteEnd },
      status: { in: ['CONFIRMED', 'SEATED'] }
    }
  })
  
  const aktuelleAuslastung = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0
  const durchschnittAuslastung = 75 // This would be calculated from historical data

  return {
    heute: {
      reservierungen: {
        gesamt: totalReservationsHeute,
        bestaetigt: confirmedReservationsHeute,
        wartend: pendingReservationsHeute
      },
      auslastung: {
        aktuell: aktuelleAuslastung,
        durchschnitt: durchschnittAuslastung
      },
      kunden: {
        neue: neueKundenHeute,
        wiederkehrend: gesamtKundenHeute - neueKundenHeute,
        vip: vipKunden
      }
    },
    trends: {
      reservierungenVsGestern: totalReservationsHeute - totalReservationsGestern,
      kundenVsGestern: neueKundenHeute - neueKundenGestern
    }
  }
}

async function getUpcomingReservations() {
  const heute = new Date()
  const morgen = new Date(heute.getTime() + 24 * 60 * 60 * 1000)
  
  return await db.reservation.findMany({
    where: {
      dateTime: { gte: heute, lte: morgen },
      status: { in: ['CONFIRMED', 'PENDING'] }
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          isVip: true
        }
      },
      table: {
        select: {
          number: true,
          location: true
        }
      }
    },
    orderBy: {
      dateTime: 'asc'
    },
    take: 5
  })
}

function MetricCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  description 
}: { 
  title: string
  value: string | number
  trend?: number
  icon: any
  description?: string 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend > 0 ? (
              <><TrendingUp className="h-3 w-3 mr-1" /> +{trend} vs gestern</>
            ) : trend < 0 ? (
              <><TrendingDown className="h-3 w-3 mr-1" /> {trend} vs gestern</>
            ) : (
              <span>Keine Änderung vs gestern</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ReservationStatus({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: 'Wartend', variant: 'secondary' as const },
    CONFIRMED: { label: 'Bestätigt', variant: 'default' as const },
    SEATED: { label: 'Eingetroffen', variant: 'default' as const },
    COMPLETED: { label: 'Abgeschlossen', variant: 'outline' as const },
    CANCELLED: { label: 'Storniert', variant: 'destructive' as const },
    NO_SHOW: { label: 'Nicht erschienen', variant: 'destructive' as const }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const [metrics, upcomingReservations] = await Promise.all([
    getDashboardMetrics(),
    getUpcomingReservations()
  ])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurück, {user.firstName}! Hier ist ein Überblick über Ihr Restaurant.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Reservierungen heute"
          value={metrics.heute.reservierungen.gesamt}
          trend={metrics.trends.reservierungenVsGestern}
          icon={Calendar}
          description={`${metrics.heute.reservierungen.bestaetigt} bestätigt, ${metrics.heute.reservierungen.wartend} wartend`}
        />
        
        <MetricCard
          title="Auslastung"
          value={`${metrics.heute.auslastung.aktuell}%`}
          icon={Table}
          description={`Durchschnitt: ${metrics.heute.auslastung.durchschnitt}%`}
        />
        
        <MetricCard
          title="Neue Kunden"
          value={metrics.heute.kunden.neue}
          trend={metrics.trends.kundenVsGestern}
          icon={Users}
        />
        
        <MetricCard
          title="VIP Kunden"
          value={metrics.heute.kunden.vip}
          icon={TrendingUp}
          description="Gesamt VIP Status"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Nächste Reservierungen
            </CardTitle>
            <CardDescription>
              Die nächsten 5 Reservierungen in den nächsten 24 Stunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {reservation.customer.firstName} {reservation.customer.lastName}
                          {reservation.customer.isVip && (
                            <Badge variant="secondary" className="ml-2 text-xs">VIP</Badge>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(reservation.dateTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {reservation.partySize} Personen
                        </span>
                        {reservation.table && (
                          <span className="flex items-center gap-1">
                            <Table className="h-3 w-3" />
                            Tisch {reservation.table.number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <ReservationStatus status={reservation.status} />
                      {reservation.status === 'PENDING' && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/reservierungen/${reservation.id}`}>
                            Bearbeiten
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/reservierungen">
                      Alle Reservierungen anzeigen
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Keine Reservierungen</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keine Reservierungen in den nächsten 24 Stunden.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>
              Häufig verwendete Aktionen und Bereiche
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/dashboard/reservierungen">
                <Calendar className="h-6 w-6 mb-2" />
                Neue Reservierung
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/kunden">
                <Users className="h-6 w-6 mb-2" />
                Kunde suchen
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/tische">
                <Table className="h-6 w-6 mb-2" />
                Tischübersicht
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/analytics">
                <TrendingUp className="h-6 w-6 mb-2" />
                Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
