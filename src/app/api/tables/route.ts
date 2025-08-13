import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { createTableSchema, tableFilterSchema } from '@/lib/validations/table'
import { z } from 'zod'

// GET /api/tables - Liste der Tische mit Filtern (Staff+ nur)
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const { searchParams } = new URL(request.url)
    const filters = {
      location: searchParams.get('location') as 'TERRACE_SEA_VIEW' | 'TERRACE_STANDARD' | 'INDOOR_WINDOW' | 'INDOOR_STANDARD' | 'BAR_AREA' | null,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      minCapacity: searchParams.get('minCapacity') ? parseInt(searchParams.get('minCapacity')!) : undefined,
      maxCapacity: searchParams.get('maxCapacity') ? parseInt(searchParams.get('maxCapacity')!) : undefined,
      shape: searchParams.get('shape') as 'RECTANGLE' | 'ROUND' | 'SQUARE' | null,
      isAvailable: searchParams.get('isAvailable') === 'true' ? true : undefined,
      dateTime: searchParams.get('dateTime') ? new Date(searchParams.get('dateTime')!) : undefined,
    }

    // Entferne undefined Werte
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )

    // Validiere Filter
    const validatedFilters = tableFilterSchema.parse(cleanFilters)

    // Erstelle WHERE Clause
    const whereClause: any = {}

    if (validatedFilters.location) {
      whereClause.location = validatedFilters.location
    }

    if (validatedFilters.isActive !== undefined) {
      whereClause.isActive = validatedFilters.isActive
    }

    if (validatedFilters.minCapacity !== undefined) {
      whereClause.capacity = { gte: validatedFilters.minCapacity }
    }

    if (validatedFilters.maxCapacity !== undefined) {
      whereClause.capacity = { 
        ...whereClause.capacity,
        lte: validatedFilters.maxCapacity
      }
    }

    if (validatedFilters.shape) {
      whereClause.shape = validatedFilters.shape
    }

    // Für Verfügbarkeit: prüfe, ob Tisch zu gegebener Zeit reserviert ist
    if (validatedFilters.isAvailable && validatedFilters.dateTime) {
      const startTime = new Date(validatedFilters.dateTime)
      const endTime = new Date(validatedFilters.dateTime.getTime() + 2 * 60 * 60 * 1000) // +2h Standard
      
      whereClause.reservations = {
        none: {
          dateTime: {
            gte: startTime,
            lt: endTime
          },
          status: {
            in: ['CONFIRMED', 'PENDING']
          }
        }
      }
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
            dateTime: { gte: new Date() } // Nur zukünftige Reservierungen
          },
          orderBy: {
            dateTime: 'asc'
          },
          take: 3 // Nächste 3 Reservierungen
        },
        qrCodes: {
          select: {
            id: true,
            code: true,
            isActive: true,
            createdAt: true
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
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
    const tablesWithStatus = tables.map(table => {
      const now = new Date()
      const currentReservation = table.reservations.find(r => {
        const reservationStart = new Date(r.dateTime)
        const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000) // +2h
        return now >= reservationStart && now <= reservationEnd && r.status === 'CONFIRMED'
      })

      let status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' = 'AVAILABLE'
      
      if (!table.isActive) {
        status = 'OUT_OF_ORDER'
      } else if (currentReservation) {
        status = 'OCCUPIED'
      } else if (table.reservations.some(r => r.status === 'CONFIRMED' && new Date(r.dateTime) > now)) {
        status = 'RESERVED'
      }

      return {
        ...table,
        currentStatus: status,
        currentReservation
      }
    })

    return NextResponse.json(tablesWithStatus)
  } catch (error) {
    console.error('Fehler beim Abrufen der Tische:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Filter', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Tische' },
      { status: 500 }
    )
  }
}

// POST /api/tables - Neuen Tisch erstellen
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = createTableSchema.parse(body)

    // Prüfe, ob Tisch mit dieser Nummer bereits existiert
    const existingTable = await db.table.findUnique({
      where: { number: validatedData.number }
    })

    if (existingTable) {
      return NextResponse.json(
        { error: 'Ein Tisch mit dieser Nummer existiert bereits' },
        { status: 409 }
      )
    }

    // Erstelle neuen Tisch
    const table = await db.table.create({
      data: validatedData,
      include: {
        reservations: {
          select: {
            id: true,
            dateTime: true,
            status: true,
            partySize: true
          }
        },
        qrCodes: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Tisches:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Tischdaten', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Tisches' },
      { status: 500 }
    )
  }
}