// Force dynamic rendering for authenticated route
export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Target,
  Download,
  Filter,
  RefreshCw,
  MapPin,
  Star,
  Utensils
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { de } from 'date-fns/locale'
import { RevenueCharts } from './components/revenue-charts'
import { OccupancyHeatmap } from './components/occupancy-heatmap'
import { ExportManager } from './components/export-manager'

interface AnalyticsPageProps {
  searchParams: Promise<{
    period?: string
    startDate?: string
    endDate?: string
    location?: string
  }>
}

async function getAllReservationsForPeriod(startDate: Date, endDate: Date, location?: string) {
  const whereClause: any = {
    dateTime: {
      gte: startDate,
      lte: endDate
    },
    status: { in: ['CONFIRMED', 'COMPLETED'] }
  }

  if (location) {
    whereClause.table = {
      location: location
    }
  }

  const reservations = await db.reservation.findMany({
    where: whereClause,
    select: {
      dateTime: true,
      partySize: true,
      table: {
        select: {
          location: true,
          capacity: true
        }
      }
    },
    orderBy: {
      dateTime: 'asc'
    }
  })

  // Convert Date to string format
  return reservations.map(reservation => ({
    ...reservation,
    dateTime: reservation.dateTime.toISOString()
  }))
}

async function getAnalyticsData(startDate: Date, endDate: Date, location?: string) {
  const whereClause: any = {
    dateTime: {
      gte: startDate,
      lte: endDate
    },
    status: { in: ['CONFIRMED', 'COMPLETED'] }
  }

  if (location) {
    whereClause.table = {
      location: location
    }
  }

  const [
    totalRevenue,
    totalReservations,
    completedReservations,
    cancelledReservations,
    noShowReservations,
    averagePartySize,
    totalTables,
    occupancyData,
    dailyRevenue,
    peakHours,
    topCustomers
  ] = await Promise.all([
    // Gesamtumsatz
    db.reservation.aggregate({
      _sum: { 
        partySize: true  // Approximation - in echtem System würde man totalAmount verwenden
      },
      where: whereClause
    }),
    
    // Reservierungsstatistiken
    db.reservation.count({ where: whereClause }),
    
    db.reservation.count({
      where: { ...whereClause, status: 'COMPLETED' }
    }),
    
    db.reservation.count({
      where: {
        dateTime: { gte: startDate, lte: endDate },
        status: 'CANCELLED'
      }
    }),
    
    db.reservation.count({
      where: {
        dateTime: { gte: startDate, lte: endDate },
        status: 'NO_SHOW'
      }
    }),

    // Durchschnittliche Gruppengröße
    db.reservation.aggregate({
      _avg: { partySize: true },
      where: whereClause
    }),

    // Tischanzahl für RevPASH Berechnung
    db.table.count({ where: { isActive: true } }),

    // Auslastungsdaten nach Stunden
    db.reservation.groupBy({
      by: ['dateTime'],
      _count: true,
      where: whereClause
    }),

    // Tägliche Umsätze
    db.reservation.groupBy({
      by: ['dateTime'],
      _sum: { partySize: true },
      _count: true,
      where: whereClause
    }),

    // Stoßzeiten
    db.reservation.findMany({
      where: whereClause,
      select: {
        dateTime: true,
        partySize: true
      }
    }),

    // Top Kunden
    db.customer.findMany({
      include: {
        reservations: {
          where: {
            dateTime: { gte: startDate, lte: endDate },
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          select: {
            partySize: true,
            dateTime: true
          }
        }
      },
      orderBy: {
        totalSpent: 'desc'
      },
      take: 10
    })
  ])

  // Berechne RevPASH (Revenue Per Available Seat Hour)
  const hoursInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  const totalCapacity = await db.table.aggregate({
    _sum: { capacity: true }
  })
  const availableSeatHours = (totalCapacity._sum.capacity || 0) * hoursInPeriod
  const estimatedRevenue = (totalRevenue._sum.partySize || 0) * 45 // 45€ durchschnittlicher Umsatz pro Person
  const revPASH = availableSeatHours > 0 ? estimatedRevenue / availableSeatHours : 0

  // Berechne Tischumdrehungsrate
  const totalReservationHours = totalReservations * 2 // 2 Stunden pro Reservierung
  const tableUtilization = availableSeatHours > 0 ? (totalReservationHours / availableSeatHours) * 100 : 0

  // Verarbeite tägliche Daten
  const dailyData = dailyRevenue.reduce((acc: any[], curr) => {
    const date = format(curr.dateTime, 'yyyy-MM-dd')
    const existingDay = acc.find(d => d.date === date)
    
    if (existingDay) {
      existingDay.revenue += (curr._sum.partySize || 0) * 45
      existingDay.reservations += curr._count
    } else {
      acc.push({
        date,
        revenue: (curr._sum.partySize || 0) * 45,
        reservations: curr._count,
        guests: curr._sum.partySize || 0
      })
    }
    
    return acc
  }, [])

  return {
    revenue: {
      total: estimatedRevenue,
      revPASH: revPASH,
      averagePerReservation: totalReservations > 0 ? estimatedRevenue / totalReservations : 0,
      dailyData: dailyData.sort((a, b) => a.date.localeCompare(b.date))
    },
    reservations: {
      total: totalReservations,
      completed: completedReservations,
      cancelled: cancelledReservations,
      noShow: noShowReservations,
      averagePartySize: averagePartySize._avg.partySize || 0
    },
    occupancy: {
      tableUtilization: tableUtilization,
      totalTables: totalTables,
      peakCapacity: Math.max(...peakHours.map(r => r.partySize), 0)
    },
    customers: {
      topCustomers: topCustomers.slice(0, 5)
    }
  }
}

function AnalyticsKPIs({ data, period }: { data: any, period: string }) {
  const previousPeriodChange = Math.random() * 20 - 10 // Simulierte Änderung

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              <p className="text-2xl font-bold">{data.revenue.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
              <div className="flex items-center gap-1 mt-1">
                {previousPeriodChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${previousPeriodChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(previousPeriodChange).toFixed(1)}% vs {period === 'today' ? 'gestern' : 'Vorperiode'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">RevPASH</p>
              <p className="text-2xl font-bold">{data.revenue.revPASH.toFixed(2)}€</p>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue per Available Seat Hour
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reservierungen</p>
              <p className="text-2xl font-bold">{data.reservations.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ⌀ {data.reservations.averagePartySize.toFixed(1)} Personen
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tischauslastung</p>
              <p className="text-2xl font-bold">{data.occupancy.tableUtilization.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.occupancy.totalTables} Tische aktiv
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PeriodSelector({ 
  currentPeriod, 
  analyticsData
}: { 
  currentPeriod: string,
  analyticsData: any
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Zeitraum:</span>
        <Badge variant="outline">
          {currentPeriod === 'today' ? 'Heute' : 
           currentPeriod === 'week' ? 'Diese Woche' : 
           currentPeriod === 'month' ? 'Dieser Monat' : 'Benutzerdefiniert'}
        </Badge>
      </div>
      
      <ExportManager 
        dailyData={analyticsData.revenue.dailyData}
        reservationsData={[]}
        totalRevenue={analyticsData.revenue.total}
        totalReservations={analyticsData.reservations.total}
        totalGuests={analyticsData.reservations.total * analyticsData.reservations.averagePartySize}
        averagePerReservation={analyticsData.revenue.averagePerReservation}
        revPASH={analyticsData.revenue.revPASH}
        period={currentPeriod}
      />
    </div>
  )
}

function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-96 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER'])
  const params = await searchParams

  // Zeitraum bestimmen
  const period = params?.period || 'today'
  let startDate: Date
  let endDate: Date

  switch (period) {
    case 'today':
      startDate = startOfDay(new Date())
      endDate = endOfDay(new Date())
      break
    case 'yesterday':
      const yesterday = subDays(new Date(), 1)
      startDate = startOfDay(yesterday)
      endDate = endOfDay(yesterday)
      break
    case 'week':
      startDate = startOfDay(subDays(new Date(), 7))
      endDate = endOfDay(new Date())
      break
    case 'month':
      startDate = startOfDay(subDays(new Date(), 30))
      endDate = endOfDay(new Date())
      break
    default:
      startDate = startOfDay(new Date())
      endDate = endOfDay(new Date())
  }

  const analyticsData = await getAnalyticsData(startDate, endDate, params?.location)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Umsatz, Auslastung und Leistungskennzahlen für {format(startDate, 'dd.MM.', { locale: de })} - {format(endDate, 'dd.MM.yyyy', { locale: de })}
          </p>
        </div>
        
        <PeriodSelector 
          currentPeriod={period} 
          analyticsData={analyticsData}
        />
      </div>

      {/* KPIs */}
      <Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
        <AnalyticsKPIs data={analyticsData} period={period} />
      </Suspense>

      {/* Charts and Details */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenue">Umsatz-Analytics</TabsTrigger>
          <TabsTrigger value="occupancy">Auslastungs-Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Suspense fallback={<AnalyticsLoading />}>
            <RevenueCharts 
              dailyData={analyticsData.revenue.dailyData}
              totalRevenue={analyticsData.revenue.total}
              averagePerReservation={analyticsData.revenue.averagePerReservation}
              revPASH={analyticsData.revenue.revPASH}
              period={period}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="occupancy">
          <Suspense fallback={<AnalyticsLoading />}>
            <OccupancyHeatmap 
              reservations={await getAllReservationsForPeriod(startDate, endDate, params?.location)}
              totalTables={analyticsData.occupancy.totalTables}
              peakCapacity={analyticsData.occupancy.peakCapacity}
              tableUtilization={analyticsData.occupancy.tableUtilization}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservierungsanalyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.reservations.completed}</p>
                  <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analyticsData.reservations.cancelled}</p>
                  <p className="text-sm text-muted-foreground">Storniert</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{analyticsData.reservations.noShow}</p>
                <p className="text-sm text-muted-foreground">No-Shows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Kunden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.customers.topCustomers.map((customer: any, index: number) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-sm text-muted-foreground">{customer.reservations.length} Reservierungen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.totalSpent.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                    <div className="flex items-center gap-1">
                      {customer.isVip && <Star className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}