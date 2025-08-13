import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'
import { startOfDay, endOfDay, format, eachDayOfInterval, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

// Validierungsschema für Revenue Analytics Parameter
const revenueAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA']).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  includeComparison: z.boolean().default(false)
})

// GET /api/analytics/revenue - Umsatz-Analytics mit RevPASH
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const { searchParams } = new URL(request.url)
    const params = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      location: searchParams.get('location'),
      granularity: searchParams.get('granularity') || 'day',
      includeComparison: searchParams.get('includeComparison') === 'true'
    }

    // Validiere Parameter
    const validatedParams = revenueAnalyticsSchema.parse(params)

    // Default Zeitraum: letzte 30 Tage
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : endOfDay(new Date())
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate) : startOfDay(subDays(endDate, 30))

    // WHERE Clause für Reservierungen
    const whereClause: any = {
      dateTime: {
        gte: startDate,
        lte: endDate
      },
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    }

    if (validatedParams.location) {
      whereClause.table = {
        location: validatedParams.location
      }
    }

    // Parallel Queries für Performance
    const [
      reservations,
      totalCapacity,
      totalTables,
      previousPeriodRevenue,
      hourlyDistribution
    ] = await Promise.all([
      // Reservierungsdaten
      db.reservation.findMany({
        where: whereClause,
        include: {
          table: {
            select: {
              capacity: true,
              location: true
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isVip: true
            }
          }
        },
        orderBy: {
          dateTime: 'asc'
        }
      }),

      // Gesamtkapazität für RevPASH
      db.table.aggregate({
        _sum: { capacity: true },
        where: validatedParams.location ? { location: validatedParams.location } : { isActive: true }
      }),

      // Tischanzahl
      db.table.count({
        where: validatedParams.location ? { location: validatedParams.location } : { isActive: true }
      }),

      // Vergleichszeitraum (falls gewünscht)
      validatedParams.includeComparison ? db.reservation.findMany({
        where: {
          ...whereClause,
          dateTime: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lte: startDate
          }
        }
      }) : Promise.resolve([]),

      // Stundenverteilung für Stoßzeiten-Analyse
      db.reservation.groupBy({
        by: ['dateTime'],
        _count: true,
        _sum: { partySize: true },
        where: whereClause
      })
    ])

    // Berechne geschätzten Umsatz (45€ pro Person Durchschnitt)
    const AVERAGE_REVENUE_PER_PERSON = 45
    const totalGuests = reservations.reduce((sum, r) => sum + r.partySize, 0)
    const totalRevenue = totalGuests * AVERAGE_REVENUE_PER_PERSON

    // RevPASH Berechnung
    const hoursInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    const totalSeats = totalCapacity._sum.capacity || 0
    const availableSeatHours = totalSeats * hoursInPeriod
    const revPASH = availableSeatHours > 0 ? totalRevenue / availableSeatHours : 0

    // Tisch-Umdrehungsrate
    const totalReservationHours = reservations.length * 2 // 2h pro Reservierung
    const tableUtilization = availableSeatHours > 0 ? (totalReservationHours / availableSeatHours) * 100 : 0

    // Tägliche Aufschlüsselung
    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dayReservations = reservations.filter(r => 
        format(r.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
      
      const dayGuests = dayReservations.reduce((sum, r) => sum + r.partySize, 0)
      const dayRevenue = dayGuests * AVERAGE_REVENUE_PER_PERSON
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        dateFormatted: format(date, 'dd.MM.', { locale: de }),
        revenue: dayRevenue,
        reservations: dayReservations.length,
        guests: dayGuests,
        averagePartySize: dayReservations.length > 0 ? dayGuests / dayReservations.length : 0
      }
    })

    // Stundenanalyse für Stoßzeiten
    const hourlyAnalysis = Array.from({ length: 24 }, (_, hour) => {
      const hourReservations = reservations.filter(r => {
        const reservationHour = new Date(r.dateTime).getHours()
        return reservationHour === hour
      })
      
      return {
        hour,
        hourFormatted: `${hour.toString().padStart(2, '0')}:00`,
        reservations: hourReservations.length,
        guests: hourReservations.reduce((sum, r) => sum + r.partySize, 0),
        revenue: hourReservations.reduce((sum, r) => sum + r.partySize, 0) * AVERAGE_REVENUE_PER_PERSON
      }
    })

    // Top-Zeiten ermitteln
    const peakHours = hourlyAnalysis
      .filter(h => h.reservations > 0)
      .sort((a, b) => b.guests - a.guests)
      .slice(0, 3)

    // Standort-Performance
    const locationPerformance = await db.reservation.groupBy({
      by: ['tableId'],
      _count: true,
      _sum: { partySize: true },
      where: whereClause
    })

    // Vergleich mit Vorperiode
    let comparison = null
    if (validatedParams.includeComparison && previousPeriodRevenue.length > 0) {
      const previousRevenue = previousPeriodRevenue.reduce((sum, r) => sum + r.partySize, 0) * AVERAGE_REVENUE_PER_PERSON
      const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
      
      comparison = {
        previousRevenue,
        revenueChange: parseFloat(revenueChange.toFixed(2)),
        previousReservations: previousPeriodRevenue.length,
        reservationChange: previousPeriodRevenue.length > 0 ? 
          ((reservations.length - previousPeriodRevenue.length) / previousPeriodRevenue.length) * 100 : 0
      }
    }

    // Response zusammenstellen
    const analyticsData = {
      summary: {
        totalRevenue,
        totalReservations: reservations.length,
        totalGuests,
        averageRevenuePerReservation: reservations.length > 0 ? totalRevenue / reservations.length : 0,
        averagePartySize: reservations.length > 0 ? totalGuests / reservations.length : 0,
        revPASH: parseFloat(revPASH.toFixed(2)),
        tableUtilization: parseFloat(tableUtilization.toFixed(2))
      },
      
      timeSeries: {
        granularity: validatedParams.granularity,
        data: dailyData
      },
      
      hourlyAnalysis: {
        data: hourlyAnalysis,
        peakHours: peakHours.map(h => ({
          hour: h.hour,
          hourFormatted: h.hourFormatted,
          guests: h.guests,
          intensity: 'high' // Könnte basierend auf Schwellenwerten berechnet werden
        }))
      },
      
      performance: {
        totalTables,
        totalSeats,
        occupancyRate: totalSeats > 0 ? (totalGuests / (totalSeats * Math.ceil(hoursInPeriod / 24))) * 100 : 0
      },
      
      period: {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startDateFormatted: format(startDate, 'dd.MM.yyyy', { locale: de }),
        endDateFormatted: format(endDate, 'dd.MM.yyyy', { locale: de }),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      
      comparison
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Fehler bei Revenue Analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Parameter', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Unzureichende Berechtigung' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Fehler bei der Umsatzanalyse' },
      { status: 500 }
    )
  }
}