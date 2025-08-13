// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCurrentUser, requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  Users,
  Table,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'
import { ReservationCalendar } from './components/reservation-calendar'
import { ReservationFilters } from './components/reservation-filters'
import { QuickStats } from './components/quick-stats'

interface ReservationsPageProps {
  searchParams: Promise<{
    date?: string
    status?: string
    tableId?: string
    search?: string
    view?: 'calendar' | 'list'
  }>
}

async function getReservations(filters: any) {
  const whereClause: any = {}
  
  if (filters.date) {
    const selectedDate = new Date(filters.date)
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    
    whereClause.dateTime = {
      gte: weekStart,
      lte: weekEnd
    }
  }
  
  if (filters.status && filters.status !== 'all') {
    whereClause.status = filters.status
  }
  
  if (filters.tableId && filters.tableId !== 'all') {
    whereClause.tableId = filters.tableId
  }
  
  if (filters.search) {
    whereClause.OR = [
      {
        customer: {
          OR: [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        }
      },
      {
        specialRequests: { contains: filters.search, mode: 'insensitive' }
      }
    ]
  }

  return await db.reservation.findMany({
    where: whereClause,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isVip: true,
          language: true
        }
      },
      table: {
        select: {
          id: true,
          number: true,
          capacity: true,
          location: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      dateTime: 'asc'
    }
  })
}

async function getTables() {
  return await db.table.findMany({
    where: { isActive: true },
    select: {
      id: true,
      number: true,
      capacity: true,
      location: true
    },
    orderBy: {
      number: 'asc'
    }
  })
}

function ReservationStatus({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: 'Wartend', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Bestätigt', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
    SEATED: { label: 'Eingetroffen', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Abgeschlossen', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
    CANCELLED: { label: 'Storniert', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    NO_SHOW: { label: 'Nicht erschienen', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  
  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
    </Badge>
  )
}

function ReservationListView({ reservations }: { reservations: any[] }) {
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {reservation.customer.firstName} {reservation.customer.lastName}
                      {reservation.customer.isVip && (
                        <Badge variant="secondary" className="ml-2 text-xs">VIP</Badge>
                      )}
                    </h3>
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
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {reservation.customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {reservation.customer.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {reservation.customer.email}
                  </span>
                  {reservation.table?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reservation.table.location.replace('_', ' ')}
                    </span>
                  )}
                </div>
                
                {reservation.specialRequests && (
                  <p className="text-sm text-muted-foreground border-l-2 border-orange-200 pl-2">
                    <strong>Wünsche:</strong> {reservation.specialRequests}
                  </p>
                )}
              </div>
              
              <div className="text-right space-y-2">
                <ReservationStatus status={reservation.status} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/reservierungen/${reservation.id}`}>
                      Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ReservationsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded animate-pulse" />
    </div>
  )
}

export default async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const params = await searchParams
  
  const currentDate = params.date ? new Date(params.date) : new Date()
  const view = params.view || 'calendar'
  
  const [reservations, tables] = await Promise.all([
    getReservations({
      date: params.date,
      status: params.status,
      tableId: params.tableId,
      search: params.search
    }),
    getTables()
  ])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservierungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Tischreservierungen und Buchungen
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/reservierungen/neu">
              <Plus className="h-4 w-4 mr-2" />
              Neue Reservierung
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
        <QuickStats reservations={reservations} />
      </Suspense>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-16 bg-muted rounded animate-pulse" />}>
            <ReservationFilters 
              tables={tables}
              currentFilters={params}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={{ pathname: '/dashboard/reservierungen', query: { ...params, view: 'calendar' } }}>
              <Calendar className="h-4 w-4 mr-2" />
              Kalender
            </Link>
          </Button>
          <Button 
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={{ pathname: '/dashboard/reservierungen', query: { ...params, view: 'list' } }}>
              <Search className="h-4 w-4 mr-2" />
              Liste
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {reservations.length} Reservierung{reservations.length !== 1 ? 'en' : ''} gefunden
        </p>
      </div>

      {/* Main Content */}
      <Suspense fallback={<ReservationsLoading />}>
        {view === 'calendar' ? (
          <ReservationCalendar 
            reservations={reservations}
            tables={tables}
            currentDate={currentDate}
          />
        ) : (
          <ReservationListView reservations={reservations} />
        )}
      </Suspense>
    </div>
  )
}
