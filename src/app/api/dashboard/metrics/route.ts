import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { z } from 'zod'

const metricsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month']).default('today'),
  compareWithPrevious: z.boolean().default(true)
})

interface DashboardMetrics {
  heute: {
    reservierungen: { gesamt: number; bestaetigt: number; wartend: number; storniert: number }
    auslastung: { aktuell: number; durchschnitt: number; prognose: number }
    kunden: { neue: number; wiederkehrend: number; vip: number; gesamt: number }
    umsatz: { geschaetzt: number; durchschnitt: number }
  }
  trends: { 
    reservierungenVsVorperiode: number
    kundenVsVorperiode: number
    auslastungVsVorperiode: number
    umsatzVsVorperiode: number
  }
  zeitraum: string
  lastUpdated: string
}

// GET /api/dashboard/metrics - Get dashboard metrics
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const query = {
      period: searchParams.get('period') || 'today',
      compareWithPrevious: searchParams.get('compareWithPrevious') === 'true'
    }

    const validatedQuery = metricsQuerySchema.parse(query)
    
    const now = new Date()
    let startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date
    
    // Set date ranges based on period
    switch (validatedQuery.period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        prevStartDate = startOfDay(subDays(now, 1))
        prevEndDate = endOfDay(subDays(now, 1))
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }) // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        prevStartDate = startOfWeek(subDays(now, 7), { weekStartsOn: 1 })
        prevEndDate = endOfWeek(subDays(now, 7), { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        prevStartDate = startOfMonth(subDays(now, 30))
        prevEndDate = endOfMonth(subDays(now, 30))
        break
      default:
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        prevStartDate = startOfDay(subDays(now, 1))
        prevEndDate = endOfDay(subDays(now, 1))
    }

    // Get current period metrics
    const [reservationMetrics, customerMetrics, tableMetrics] = await Promise.all([
      // Reservation metrics
      db.reservation.groupBy({
        by: ['status'],
        where: {
          dateTime: { gte: startDate, lte: endDate }
        },
        _count: {
          id: true
        }
      }),
      
      // Customer metrics
      Promise.all([
        db.customer.count({
          where: { createdAt: { gte: startDate, lte: endDate } }
        }),
        db.customer.count({ where: { isVip: true } }),
        db.customer.count()
      ]),
      
      // Table and occupancy metrics
      Promise.all([
        db.table.count({ where: { isActive: true } }),
        db.reservation.count({
          where: {
            dateTime: { gte: startDate, lte: endDate },
            status: { in: ['CONFIRMED', 'SEATED'] }
          }
        })
      ])
    ])

    // Process reservation metrics
    const reservationCounts = reservationMetrics.reduce(
      (acc, curr) => {
        acc[curr.status.toLowerCase()] = curr._count.id
        return acc
      },
      { pending: 0, confirmed: 0, seated: 0, completed: 0, cancelled: 0, no_show: 0 } as Record<string, number>
    )

    const totalReservations = Object.values(reservationCounts).reduce((a, b) => a + b, 0)
    const confirmedReservations = reservationCounts.confirmed + reservationCounts.seated + reservationCounts.completed
    const pendingReservations = reservationCounts.pending
    const cancelledReservations = reservationCounts.cancelled + reservationCounts.no_show

    // Calculate occupancy
    const [totalTables, occupiedSlots] = tableMetrics
    const currentOccupancy = totalTables > 0 ? Math.round((occupiedSlots / totalTables) * 100) : 0
    
    // Estimated revenue (simplified calculation)
    const averageRevenuePerReservation = 85 // This would come from historical data
    const estimatedRevenue = confirmedReservations * averageRevenuePerReservation

    // Get comparison metrics if requested
    let trends = {
      reservierungenVsVorperiode: 0,
      kundenVsVorperiode: 0,
      auslastungVsVorperiode: 0,
      umsatzVsVorperiode: 0
    }

    if (validatedQuery.compareWithPrevious) {
      const [prevReservations, prevCustomers, prevOccupiedSlots] = await Promise.all([
        db.reservation.count({
          where: { dateTime: { gte: prevStartDate, lte: prevEndDate } }
        }),
        db.customer.count({
          where: { createdAt: { gte: prevStartDate, lte: prevEndDate } }
        }),
        db.reservation.count({
          where: {
            dateTime: { gte: prevStartDate, lte: prevEndDate },
            status: { in: ['CONFIRMED', 'SEATED'] }
          }
        })
      ])

      const prevOccupancy = totalTables > 0 ? Math.round((prevOccupiedSlots / totalTables) * 100) : 0
      const prevRevenue = prevReservations * averageRevenuePerReservation

      trends = {
        reservierungenVsVorperiode: totalReservations - prevReservations,
        kundenVsVorperiode: customerMetrics[0] - prevCustomers,
        auslastungVsVorperiode: currentOccupancy - prevOccupancy,
        umsatzVsVorperiode: estimatedRevenue - prevRevenue
      }
    }

    const metrics: DashboardMetrics = {
      heute: {
        reservierungen: {
          gesamt: totalReservations,
          bestaetigt: confirmedReservations,
          wartend: pendingReservations,
          storniert: cancelledReservations
        },
        auslastung: {
          aktuell: currentOccupancy,
          durchschnitt: 75, // This would be calculated from historical data
          prognose: Math.min(currentOccupancy + 15, 100) // Simple forecast
        },
        kunden: {
          neue: customerMetrics[0],
          wiederkehrend: customerMetrics[2] - customerMetrics[0],
          vip: customerMetrics[1],
          gesamt: customerMetrics[2]
        },
        umsatz: {
          geschaetzt: estimatedRevenue,
          durchschnitt: averageRevenuePerReservation
        }
      },
      trends,
      zeitraum: validatedQuery.period,
      lastUpdated: now.toISOString()
    }

    // Add cache headers for performance
    const response = NextResponse.json(metrics)
    response.headers.set('Cache-Control', 'public, max-age=60') // Cache for 1 minute
    
    return response
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
