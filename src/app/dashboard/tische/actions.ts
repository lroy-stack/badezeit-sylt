'use server'

import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { tableLayoutUpdateSchema } from '@/lib/validations/table'
import { z } from 'zod'

// Server Action für Tisch-Layout automatische Anordnung
export async function tischeLayoutAutomatischAnordnen(tables: Array<{
  id: string
  xPosition: number
  yPosition: number
  shape: string
}>) {
  try {
    // Authentifizierung prüfen
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    
    // Validiere Request-Daten
    const validatedData = tableLayoutUpdateSchema.parse({ tables })
    
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
      
      throw new Error(`Einige Tische wurden nicht gefunden: ${missingIds.join(', ')}`)
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

    return {
      success: true,
      message: `${updatedTables.length} Tische wurden automatisch angeordnet`,
      updatedTables
    }

  } catch (error) {
    console.error('Fehler bei der automatischen Tisch-Anordnung:', error)
    
    if (error instanceof z.ZodError) {
      throw new Error(`Ungültige Layout-Daten: ${error.issues.map(i => i.message).join(', ')}`)
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      throw new Error('Nicht autorisiert')
    }

    throw new Error('Fehler beim automatischen Anordnen der Tische')
  }
}