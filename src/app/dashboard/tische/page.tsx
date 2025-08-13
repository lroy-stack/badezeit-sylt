import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Table,
  LayoutGrid,
  Settings,
  Plus,
  QrCode,
  BarChart3,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { TableStats } from './components/table-stats'
import { TableAnalytics } from './components/table-analytics'
import { TableFilters } from './components/table-filters'
import { TableFloorPlan } from './components/table-floor-plan'
import { TableStatusPanel } from './components/table-status-panel'
import { TableConfiguration } from './components/table-configuration'
import { EnhancedQRManager } from './components/enhanced-qr-manager'
import { TabsNavigation } from './components/tabs-navigation'
import { HeaderActions } from './components/header-actions'

interface TablesPageProps {
  searchParams: Promise<{
    tab?: string
    location?: string
    status?: string
    capacity?: string
    shape?: string
    view?: string
  }>
}

async function getTables(filters: any = {}) {
  const whereClause: any = {}
  
  if (filters.location) {
    whereClause.location = filters.location
  }
  
  if (filters.capacity) {
    const capacity = parseInt(filters.capacity)
    whereClause.capacity = capacity
  }
  
  if (filters.shape) {
    whereClause.shape = filters.shape
  }

  const tables = await db.table.findMany({
    where: whereClause,
    include: {
      reservations: {
        select: {
          id: true,
          dateTime: true,
          status: true,
          partySize: true,
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          dateTime: { gte: new Date() }
        },
        orderBy: {
          dateTime: 'asc'
        },
        take: 3
      },
      qrCodes: {
        select: {
          id: true,
          code: true,
          isActive: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      _count: {
        select: {
          reservations: true
        }
      }
    },
    orderBy: [
      { location: 'asc' },
      { number: 'asc' }
    ]
  })

  // Berechne aktuellen Status für jeden Tisch
  const now = new Date()
  const tablesWithStatus = tables.map(table => {
    const currentReservation = table.reservations.find(r => {
      const reservationStart = new Date(r.dateTime)
      const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000) // +2h
      return now >= reservationStart && now <= reservationEnd && r.status === 'CONFIRMED'
    })

    let currentStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' = 'AVAILABLE'
    
    if (!table.isActive) {
      currentStatus = 'OUT_OF_ORDER'
    } else if (currentReservation) {
      currentStatus = 'OCCUPIED'
    } else if (table.reservations.some(r => r.status === 'CONFIRMED' && new Date(r.dateTime) > now)) {
      currentStatus = 'RESERVED'
    }

    return {
      ...table,
      currentStatus,
      currentReservation
    }
  })

  return tablesWithStatus
}

async function getTableStats() {
  const [
    totalTables,
    activeTables,
    totalCapacity,
    currentOccupied,
    upcomingReservations,
    qrCodes
  ] = await Promise.all([
    db.table.count(),
    db.table.count({ where: { isActive: true } }),
    db.table.aggregate({ _sum: { capacity: true } }),
    // Geschätzte aktuelle Belegung (vereinfacht)
    db.reservation.count({
      where: {
        status: 'CONFIRMED',
        dateTime: {
          lte: new Date(),
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Letzten 2 Stunden
        }
      }
    }),
    db.reservation.count({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        dateTime: { gte: new Date() }
      }
    }),
    db.qRCode.count({ where: { isActive: true } })
  ])

  // Statistiken nach Standort
  const locationStats = await db.table.groupBy({
    by: ['location'],
    _count: true,
    _sum: { capacity: true }
  })

  return {
    total: totalTables,
    active: activeTables,
    inactive: totalTables - activeTables,
    totalCapacity: totalCapacity._sum.capacity || 0,
    currentOccupied,
    upcomingReservations,
    activeQrCodes: qrCodes,
    occupancyRate: totalTables > 0 ? Math.round((currentOccupied / totalTables) * 100) : 0,
    locationStats: locationStats.reduce((acc, stat) => ({
      ...acc,
      [stat.location]: {
        count: stat._count,
        capacity: stat._sum.capacity || 0
      }
    }), {})
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'OCCUPIED':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case 'RESERVED':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'MAINTENANCE':
      return <Settings className="h-4 w-4 text-blue-600" />
    case 'OUT_OF_ORDER':
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return <CheckCircle className="h-4 w-4 text-green-600" />
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'Verfügbar'
    case 'OCCUPIED':
      return 'Besetzt'
    case 'RESERVED':
      return 'Reserviert'
    case 'MAINTENANCE':
      return 'Wartung'
    case 'OUT_OF_ORDER':
      return 'Außer Betrieb'
    default:
      return 'Verfügbar'
  }
}

function getLocationLabel(location: string) {
  switch (location) {
    case 'TERRACE_SEA_VIEW':
      return 'Terrasse Meerblick'
    case 'TERRACE_STANDARD':
      return 'Terrasse Standard'
    case 'INDOOR_WINDOW':
      return 'Innen Fenster'
    case 'INDOOR_STANDARD':
      return 'Innen Standard'
    case 'BAR_AREA':
      return 'Barbereich'
    default:
      return location
  }
}

function TableCard({ table }: { table: any }) {
  const statusIcon = getStatusIcon(table.currentStatus)
  const statusLabel = getStatusLabel(table.currentStatus)
  const locationLabel = getLocationLabel(table.location)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tisch {table.number}</CardTitle>
          <div className="flex items-center gap-1">
            {statusIcon}
            <Badge variant={
              table.currentStatus === 'AVAILABLE' ? 'default' :
              table.currentStatus === 'OCCUPIED' ? 'destructive' :
              table.currentStatus === 'RESERVED' ? 'secondary' :
              'outline'
            }>
              {statusLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Standort:</span>
            <span>{locationLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kapazität:</span>
            <span>{table.capacity} Personen</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Form:</span>
            <span>{table.shape === 'RECTANGLE' ? 'Rechteckig' : table.shape === 'ROUND' ? 'Rund' : 'Quadratisch'}</span>
          </div>
          
          {table.currentReservation && (
            <div className="mt-3 p-2 bg-muted rounded text-xs">
              <p className="font-medium">Aktuelle Reservierung:</p>
              <p className="text-muted-foreground">
                {table.currentReservation.customer.firstName} {table.currentReservation.customer.lastName} • {' '}
                {table.currentReservation.partySize} Personen
              </p>
            </div>
          )}
          
          {table.reservations.length > 0 && !table.currentReservation && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
              <p className="font-medium text-blue-800">Nächste Reservierung:</p>
              <p className="text-blue-700">
                {new Date(table.reservations[0].dateTime).toLocaleString('de-DE')}
              </p>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <span>Reservierungen gesamt: {table._count.reservations}</span>
            {table.qrCodes.length > 0 && (
              <span className="flex items-center gap-1">
                <QrCode className="h-3 w-3" />
                QR aktiv
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TablesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

interface User {
  id: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN'
  email: string
}

interface TableStats {
  total: number
  active: number
  inactive: number
  totalCapacity: number
  currentOccupied: number
  upcomingReservations: number
  activeQrCodes: number
  occupancyRate: number
  locationStats: Record<string, any>
}

export default async function TablesPage({ searchParams }: TablesPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const params = await searchParams
  
  const [tables, stats] = await Promise.all([
    getTables({
      location: params?.location,
      capacity: params?.capacity,
      shape: params?.shape
    }),
    getTableStats()
  ])

  const currentTab = params?.tab || 'overview'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tischverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Tische, Layouts und QR-Codes für optimale Auslastung
          </p>
        </div>
        
        <HeaderActions userRole={user.role} />
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
        <TableStats stats={stats} />
      </Suspense>

      {/* Main Content */}
      <Tabs value={currentTab} className="space-y-6">
        <TabsNavigation currentTab={currentTab} />

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <TableFilters currentFilters={params || {}} />
            </CardContent>
          </Card>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table: any) => (
              <Card key={table.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Tisch {table.number}</h4>
                    <Badge variant={table.isActive ? 'default' : 'secondary'}>
                      {table.capacity} Plätze
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Status: {table.currentStatus}</div>
                    <div>Standort: {table.location}</div>
                    {table.reservations.length > 0 && (
                      <div>Nächste: {new Date(table.reservations[0].dateTime).toLocaleString('de-DE')}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
            <TableAnalytics tables={tables} />
          </Suspense>
        </TabsContent>

        <TabsContent value="floorplan">
          <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
            <TableFloorPlan tables={tables} />
          </Suspense>
        </TabsContent>

        <TabsContent value="status">
          <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
            <TableStatusPanel tables={tables} />
          </Suspense>
        </TabsContent>

        <TabsContent value="configuration">
          <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
            <TableConfiguration tables={tables} user={user} />
          </Suspense>
        </TabsContent>

        <TabsContent value="qrcodes">
          <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
            <EnhancedQRManager tables={tables} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}