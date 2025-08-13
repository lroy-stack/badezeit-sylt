import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { updateTableSchema } from '@/lib/validations/table'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/tables/[id] - Einzelnen Tisch abrufen
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const { id } = await context.params

    const table = await db.table.findUnique({
      where: { id },
      include: {
        reservations: {
          select: {
            id: true,
            dateTime: true,
            status: true,
            partySize: true,
            specialRequests: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: {
            dateTime: 'desc'
          },
          take: 10 // Letzte 10 Reservierungen
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
          }
        },
        _count: {
          select: {
            reservations: true
          }
        }
      }
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Tisch nicht gefunden' },
        { status: 404 }
      )
    }

    // Berechne zusätzliche Statistiken
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      recentReservations,
      upcomingReservations,
      monthlyStats
    ] = await Promise.all([
      db.reservation.count({
        where: {
          tableId: id,
          dateTime: { gte: thirtyDaysAgo },
          status: 'COMPLETED'
        }
      }),
      db.reservation.count({
        where: {
          tableId: id,
          dateTime: { gte: now },
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      }),
      db.reservation.groupBy({
        by: ['status'],
        where: {
          tableId: id,
          dateTime: { gte: thirtyDaysAgo }
        },
        _count: true
      })
    ])

    // Bestimme aktuellen Status
    const currentReservation = table.reservations.find(r => {
      const reservationStart = new Date(r.dateTime)
      const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000)
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

    const tableWithExtendedData = {
      ...table,
      currentStatus,
      currentReservation,
      stats: {
        recentReservations,
        upcomingReservations,
        monthlyStats: monthlyStats.reduce((acc, stat) => ({
          ...acc,
          [stat.status]: stat._count
        }), {})
      }
    }

    return NextResponse.json(tableWithExtendedData)
  } catch (error) {
    console.error('Fehler beim Abrufen des Tisches:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Tisches' },
      { status: 500 }
    )
  }
}

// PUT /api/tables/[id] - Tisch aktualisieren
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const { id } = await context.params
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = updateTableSchema.parse({ id, ...body })

    // Prüfe, ob Tisch existiert
    const existingTable = await db.table.findUnique({
      where: { id }
    })

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Tisch nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe Tischnummer-Eindeutigkeit bei Änderung
    if (validatedData.number && validatedData.number !== existingTable.number) {
      const numberConflict = await db.table.findFirst({
        where: {
          number: validatedData.number,
          id: { not: id }
        }
      })

      if (numberConflict) {
        return NextResponse.json(
          { error: 'Ein Tisch mit dieser Nummer existiert bereits' },
          { status: 409 }
        )
      }
    }

    // Aktualisiere Tisch
    const { id: _, ...updateData } = validatedData
    const updatedTable = await db.table.update({
      where: { id },
      data: updateData,
      include: {
        reservations: {
          select: {
            id: true,
            dateTime: true,
            status: true,
            partySize: true
          },
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            dateTime: { gte: new Date() }
          },
          orderBy: {
            dateTime: 'asc'
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

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Tisches:', error)
    
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
      { error: 'Fehler beim Aktualisieren des Tisches' },
      { status: 500 }
    )
  }
}

// DELETE /api/tables/[id] - Tisch löschen
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(['ADMIN']) // Nur Admins können Tische löschen
    
    const { id } = await context.params

    // Prüfe, ob Tisch existiert
    const existingTable = await db.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            dateTime: { gte: new Date() }
          }
        }
      }
    })

    if (!existingTable) {
      return NextResponse.json(
        { error: 'Tisch nicht gefunden' },
        { status: 404 }
      )
    }

    // Verhindere Löschen, wenn noch aktive Reservierungen vorhanden
    if (existingTable.reservations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Tisch kann nicht gelöscht werden: Es gibt noch aktive Reservierungen',
          reservationsCount: existingTable.reservations.length
        },
        { status: 409 }
      )
    }

    // Lösche Tisch (QR-Codes werden automatisch durch CASCADE gelöscht)
    await db.table.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Tisch erfolgreich gelöscht' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Fehler beim Löschen des Tisches:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Löschen des Tisches' },
      { status: 500 }
    )
  }
}