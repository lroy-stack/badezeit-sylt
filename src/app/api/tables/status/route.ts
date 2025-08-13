import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { tableStatusUpdateSchema, bulkTableUpdateSchema } from '@/lib/validations/table'
import { z } from 'zod'

// PATCH /api/tables/status - Status von einem oder mehreren Tischen aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const body = await request.json()
    
    // Prüfe, ob es sich um ein Bulk-Update oder Einzelupdate handelt
    if (Array.isArray(body)) {
      // Bulk Update
      const validatedUpdates = z.array(tableStatusUpdateSchema).parse(body)
      
      const updatePromises = validatedUpdates.map(async (update) => {
        const table = await db.table.findUnique({
          where: { id: update.tableId }
        })
        
        if (!table) {
          throw new Error(`Tisch mit ID ${update.tableId} nicht gefunden`)
        }

        // Für bestimmte Status-Änderungen sind zusätzliche Berechtigungen erforderlich
        if (update.status === 'OUT_OF_ORDER') {
          await requireRole(['ADMIN', 'MANAGER'])
        }

        return db.table.update({
          where: { id: update.tableId },
          data: {
            // Der Status wird über isActive gesteuert
            isActive: update.status !== 'OUT_OF_ORDER',
            description: update.notes || table.description,
            updatedAt: new Date()
          },
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
              }
            }
          }
        })
      })
      
      const updatedTables = await Promise.all(updatePromises)
      
      return NextResponse.json({
        message: `${updatedTables.length} Tische erfolgreich aktualisiert`,
        updatedTables
      })
      
    } else {
      // Einzelnes Update
      const validatedUpdate = tableStatusUpdateSchema.parse(body)
      
      const existingTable = await db.table.findUnique({
        where: { id: validatedUpdate.tableId },
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

      // Statusvalidierung
      if (validatedUpdate.status === 'OUT_OF_ORDER') {
        await requireRole(['ADMIN', 'MANAGER'])
        
        // Warnen, wenn aktive Reservierungen vorhanden sind
        if (existingTable.reservations.length > 0) {
          return NextResponse.json(
            { 
              error: 'Tisch kann nicht außer Betrieb gesetzt werden: Es gibt aktive Reservierungen',
              activeReservations: existingTable.reservations.length
            },
            { status: 409 }
          )
        }
      }

      // Spezielle Behandlung für MAINTENANCE Status
      if (validatedUpdate.status === 'MAINTENANCE') {
        // Erstelle Wartungsnotiz
        const maintenanceNote = `Wartung: ${validatedUpdate.notes || 'Keine Details angegeben'}`
        
        // Wenn geschätzter freier Zeitpunkt angegeben, erweitere die Notiz
        if (validatedUpdate.estimatedFreeTime) {
          const freeTime = new Date(validatedUpdate.estimatedFreeTime).toLocaleString('de-DE')
          maintenanceNote.concat(` | Voraussichtlich frei: ${freeTime}`)
        }
      }

      const updatedTable = await db.table.update({
        where: { id: validatedUpdate.tableId },
        data: {
          isActive: validatedUpdate.status !== 'OUT_OF_ORDER',
          description: validatedUpdate.notes ? 
            `${existingTable.description ? existingTable.description + ' | ' : ''}${validatedUpdate.notes}` : 
            existingTable.description,
          updatedAt: new Date()
        },
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
            }
          },
          _count: {
            select: {
              reservations: true
            }
          }
        }
      })

      // Berechne aktuellen Status für die Antwort
      const now = new Date()
      const currentReservation = updatedTable.reservations.find(r => {
        const reservationStart = new Date(r.dateTime)
        const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000)
        return now >= reservationStart && now <= reservationEnd && r.status === 'CONFIRMED'
      })

      const currentStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' = validatedUpdate.status
      
      const tableWithStatus = {
        ...updatedTable,
        currentStatus,
        currentReservation,
        lastStatusUpdate: new Date(),
        statusUpdatedBy: 'current_user' // TODO: Get actual user from auth
      }

      return NextResponse.json(tableWithStatus)
    }
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Tischstatus:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Statusdaten', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
      }
      
      if (error.message.includes('nicht gefunden')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Tischstatus' },
      { status: 500 }
    )
  }
}

// GET /api/tables/status - Aktuelle Status aller Tische abrufen (für Real-Time Updates)
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const tables = await db.table.findMany({
      select: {
        id: true,
        number: true,
        location: true,
        isActive: true,
        capacity: true,
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
          take: 1,
          orderBy: {
            dateTime: 'asc'
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: [
        { location: 'asc' },
        { number: 'asc' }
      ]
    })

    const now = new Date()
    const tablesWithCurrentStatus = tables.map(table => {
      const nextReservation = table.reservations[0]
      let currentStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' = 'AVAILABLE'
      
      if (!table.isActive) {
        currentStatus = 'OUT_OF_ORDER'
      } else if (nextReservation) {
        const reservationStart = new Date(nextReservation.dateTime)
        const reservationEnd = new Date(reservationStart.getTime() + 2 * 60 * 60 * 1000)
        
        if (now >= reservationStart && now <= reservationEnd && nextReservation.status === 'CONFIRMED') {
          currentStatus = 'OCCUPIED'
        } else if (nextReservation.status === 'CONFIRMED' && reservationStart > now) {
          currentStatus = 'RESERVED'
        }
      }
      
      return {
        id: table.id,
        number: table.number,
        location: table.location,
        capacity: table.capacity,
        currentStatus,
        nextReservation: nextReservation || null,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json(tablesWithCurrentStatus)
  } catch (error) {
    console.error('Fehler beim Abrufen der Tischstatus:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Tischstatus' },
      { status: 500 }
    )
  }
}