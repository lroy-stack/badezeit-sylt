import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservationAvailabilitySchema } from '@/lib/validations/reservation'
import { z } from 'zod'

// POST /api/availability - Check table availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = reservationAvailabilitySchema.parse(body)

    const { dateTime, partySize, duration, preferredLocation } = validatedData

    // Find all tables that can accommodate the party size
    const whereClause: any = {
      capacity: { gte: partySize },
      isActive: true,
    }

    if (preferredLocation) {
      whereClause.location = preferredLocation
    }

    const availableTables = await db.table.findMany({
      where: whereClause,
      include: {
        reservations: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'SEATED']
            },
            // Check for overlapping reservations
            OR: [
              {
                // Reservation starts during our time slot
                dateTime: {
                  gte: dateTime,
                  lt: new Date(dateTime.getTime() + duration * 60 * 1000),
                }
              },
              {
                // Reservation ends during our time slot
                AND: [
                  {
                    dateTime: {
                      lt: dateTime
                    }
                  },
                  {
                    // Calculate end time of existing reservation
                    dateTime: {
                      gt: new Date(dateTime.getTime() - 180 * 60 * 1000) // Assume max 3 hour reservations
                    }
                  }
                ]
              },
              {
                // Our reservation is completely within existing reservation
                AND: [
                  {
                    dateTime: {
                      lte: dateTime
                    }
                  },
                  {
                    dateTime: {
                      gte: new Date(dateTime.getTime() + duration * 60 * 1000)
                    }
                  }
                ]
              }
            ]
          }
        }
      },
      orderBy: [
        { location: 'asc' },
        { capacity: 'asc' },
        { number: 'asc' },
      ]
    })

    // Filter out tables with conflicting reservations
    const trulyAvailableTables = availableTables.filter(table => {
      return table.reservations.every(reservation => {
        const reservationEnd = new Date(reservation.dateTime.getTime() + reservation.duration * 60 * 1000)
        const requestedEnd = new Date(dateTime.getTime() + duration * 60 * 1000)
        
        // No overlap if one ends before the other starts
        return reservationEnd <= dateTime || reservation.dateTime >= requestedEnd
      })
    })

    // Group available tables by location
    const tablesByLocation = trulyAvailableTables.reduce((acc, table) => {
      const location = table.location
      if (!acc[location]) {
        acc[location] = []
      }
      
      acc[location].push({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        description: table.description,
      })
      
      return acc
    }, {} as Record<string, any[]>)

    // Calculate pricing tiers (premium locations cost more)
    const locationPricing = {
      TERRACE_SEA_VIEW: 1.2, // 20% premium
      TERRACE_STANDARD: 1.1, // 10% premium
      INDOOR_WINDOW: 1.0, // Base price
      INDOOR_STANDARD: 0.9, // 10% discount
      BAR_AREA: 0.8, // 20% discount
    }

    const availabilityResponse = {
      available: trulyAvailableTables.length > 0,
      totalTables: trulyAvailableTables.length,
      requestedDateTime: dateTime,
      partySize,
      duration,
      preferredLocation,
      tablesByLocation,
      recommendations: trulyAvailableTables.slice(0, 5).map(table => ({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        description: table.description,
        priceMultiplier: locationPricing[table.location as keyof typeof locationPricing] || 1.0,
      })),
      alternativeTimes: [] // TODO: Implement alternative time suggestions
    }

    return NextResponse.json(availabilityResponse)
  } catch (error) {
    console.error('Error checking availability:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid availability request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

// GET /api/availability - Get general availability information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const queryDate = new Date(date)
    const startOfDay = new Date(queryDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(queryDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all reservations for the date
    const reservations = await db.reservation.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'SEATED']
        }
      },
      include: {
        table: true,
      },
      orderBy: {
        dateTime: 'asc',
      }
    })

    // Get all active tables
    const allTables = await db.table.findMany({
      where: { isActive: true },
      orderBy: [
        { location: 'asc' },
        { number: 'asc' },
      ]
    })

    // Calculate availability by hour for the day
    const hourlyAvailability = []
    for (let hour = 12; hour <= 22; hour++) { // Restaurant hours 12:00 - 22:00
      const timeSlot = new Date(queryDate)
      timeSlot.setHours(hour, 0, 0, 0)
      
      const occupiedTableIds = reservations
        .filter(reservation => {
          const reservationEnd = new Date(reservation.dateTime.getTime() + reservation.duration * 60 * 1000)
          return reservation.dateTime <= timeSlot && reservationEnd > timeSlot
        })
        .map(reservation => reservation.tableId)
        .filter(Boolean)

      const availableCount = allTables.length - occupiedTableIds.length
      const totalCapacity = allTables
        .filter(table => !occupiedTableIds.includes(table.id))
        .reduce((sum, table) => sum + table.capacity, 0)

      hourlyAvailability.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        availableTables: availableCount,
        totalCapacity,
        occupancyRate: Math.round(((allTables.length - availableCount) / allTables.length) * 100),
      })
    }

    return NextResponse.json({
      date: queryDate.toISOString().split('T')[0],
      totalTables: allTables.length,
      totalReservations: reservations.length,
      hourlyAvailability,
      peakHours: hourlyAvailability
        .filter(slot => slot.occupancyRate > 80)
        .map(slot => slot.time),
      recommendedTimes: hourlyAvailability
        .filter(slot => slot.occupancyRate < 60)
        .map(slot => slot.time)
        .slice(0, 3),
    })
  } catch (error) {
    console.error('Error fetching daily availability:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch availability information' },
      { status: 500 }
    )
  }
}