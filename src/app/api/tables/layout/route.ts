import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { tableLayoutUpdateSchema } from '@/lib/validations/table'
import { z } from 'zod'

// POST /api/tables/layout - Batch-Update für Tischpositionen (Drag-Drop)
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = tableLayoutUpdateSchema.parse(body)
    
    // Prüfe, ob alle Tische existieren
    const existingTables = await db.table.findMany({
      where: {
        id: { in: validatedData.tables.map(t => t.id) }
      },
      select: {
        id: true,
        number: true,
        location: true
      }
    })
    
    if (existingTables.length !== validatedData.tables.length) {
      const existingIds = existingTables.map(t => t.id)
      const missingIds = validatedData.tables
        .filter(t => !existingIds.includes(t.id))
        .map(t => t.id)
      
      return NextResponse.json(
        { 
          error: 'Einige Tische wurden nicht gefunden',
          missingIds
        },
        { status: 404 }
      )
    }

    // Validiere Positionsbereiche (0-1000 für x und y)
    const invalidPositions = validatedData.tables.filter(table => 
      table.xPosition < 0 || table.xPosition > 1000 || 
      table.yPosition < 0 || table.yPosition > 1000
    )
    
    if (invalidPositions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Ungültige Positionen detected (müssen zwischen 0 und 1000 liegen)',
          invalidTables: invalidPositions.map(t => ({ id: t.id, x: t.xPosition, y: t.yPosition }))
        },
        { status: 400 }
      )
    }

    // Prüfe auf Kollisionen (optional - zwei Tische dürfen sich nicht überlappen)
    const collisionThreshold = 50 // Minimaler Abstand zwischen Tischen
    const collisions: Array<{ table1: string, table2: string }> = []
    
    for (let i = 0; i < validatedData.tables.length; i++) {
      for (let j = i + 1; j < validatedData.tables.length; j++) {
        const table1 = validatedData.tables[i]
        const table2 = validatedData.tables[j]
        
        const distance = Math.sqrt(
          Math.pow(table1.xPosition - table2.xPosition, 2) + 
          Math.pow(table1.yPosition - table2.yPosition, 2)
        )
        
        if (distance < collisionThreshold) {
          collisions.push({
            table1: table1.id,
            table2: table2.id
          })
        }
      }
    }
    
    // Warnung bei Kollisionen, aber nicht blockierend
    if (collisions.length > 0) {
      console.warn('Kollisionen erkannt zwischen Tischen:', collisions)
    }

    // Führe atomische Updates durch
    const updatePromises = validatedData.tables.map(table => 
      db.table.update({
        where: { id: table.id },
        data: {
          xPosition: table.xPosition,
          yPosition: table.yPosition,
          ...(table.shape && { shape: table.shape }),
          updatedAt: new Date()
        },
        select: {
          id: true,
          number: true,
          xPosition: true,
          yPosition: true,
          shape: true,
          location: true,
          capacity: true,
          isActive: true
        }
      })
    )

    // Führe alle Updates in einer Transaktion aus
    const updatedTables = await db.$transaction(updatePromises)

    // Speichere Layout-Snapshot für Wiederherstellung
    await db.$executeRaw`
      INSERT INTO layout_snapshots (layout_data, created_by, created_at)
      VALUES (${JSON.stringify(updatedTables)}, 'system', NOW())
      ON CONFLICT DO NOTHING
    `.catch(() => {
      // Layout-Snapshots sind optional - Fehler nicht blockierend
      console.warn('Layout-Snapshot konnte nicht gespeichert werden')
    })

    // Berechne Layout-Statistiken
    const layoutStats = {
      tablesUpdated: updatedTables.length,
      collisions: collisions.length,
      locationDistribution: updatedTables.reduce((acc, table) => {
        acc[table.location] = (acc[table.location] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averagePosition: {
        x: Math.round(updatedTables.reduce((sum, t) => sum + (t.xPosition || 0), 0) / updatedTables.length),
        y: Math.round(updatedTables.reduce((sum, t) => sum + (t.yPosition || 0), 0) / updatedTables.length)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedTables.length} Tischpositionen erfolgreich aktualisiert`,
      updatedTables,
      layoutStats,
      ...(collisions.length > 0 && { warnings: { collisions } })
    })

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Tischlayouts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Layout-Daten', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Tischlayouts' },
      { status: 500 }
    )
  }
}

// GET /api/tables/layout - Aktuelles Layout abrufen
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const whereClause: any = {}
    
    if (location) {
      whereClause.location = location
    }
    
    if (!includeInactive) {
      whereClause.isActive = true
    }

    const tables = await db.table.findMany({
      where: whereClause,
      select: {
        id: true,
        number: true,
        capacity: true,
        location: true,
        isActive: true,
        xPosition: true,
        yPosition: true,
        shape: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { location: 'asc' },
        { number: 'asc' }
      ]
    })

    // Formatiere für react-grid-layout
    const gridLayoutData = tables.map(table => ({
      i: table.id, // Eindeutige ID für Grid Layout
      x: table.xPosition || 0,
      y: table.yPosition || 0,
      w: getTableWidth(table.shape, table.capacity),
      h: getTableHeight(table.shape, table.capacity),
      minW: 1,
      maxW: 4,
      minH: 1,
      maxH: 3,
      isDraggable: true,
      isResizable: false,
      table: {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        isActive: table.isActive,
        shape: table.shape,
        description: table.description
      }
    }))

    // Gruppiere nach Location für verschiedene Layouts
    const layoutsByLocation = tables.reduce((acc, table) => {
      if (!acc[table.location]) {
        acc[table.location] = []
      }
      
      acc[table.location].push({
        i: table.id,
        x: table.xPosition || 0,
        y: table.yPosition || 0,
        w: getTableWidth(table.shape, table.capacity),
        h: getTableHeight(table.shape, table.capacity)
      })
      
      return acc
    }, {} as Record<string, Array<any>>)

    return NextResponse.json({
      tables,
      gridLayoutData,
      layoutsByLocation,
      summary: {
        totalTables: tables.length,
        activeTables: tables.filter(t => t.isActive).length,
        locationCounts: tables.reduce((acc, table) => {
          acc[table.location] = (acc[table.location] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen des Layouts:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Layouts' },
      { status: 500 }
    )
  }
}

// Hilfsfunktionen für Tischgrößenberechnung
function getTableWidth(shape: 'RECTANGLE' | 'ROUND' | 'SQUARE', capacity: number): number {
  if (capacity <= 2) return 1
  if (capacity <= 4) return 2
  if (capacity <= 6) return 3
  return 4
}

function getTableHeight(shape: 'RECTANGLE' | 'ROUND' | 'SQUARE', capacity: number): number {
  if (shape === 'ROUND') {
    if (capacity <= 4) return 2
    if (capacity <= 8) return 3
    return 4
  }
  
  if (shape === 'SQUARE') {
    if (capacity <= 4) return 2
    return 3
  }
  
  // RECTANGLE
  if (capacity <= 2) return 1
  if (capacity <= 6) return 2
  return 3
}