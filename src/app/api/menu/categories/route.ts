import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { createMenuCategorySchema, updateMenuCategorySchema } from '@/lib/validations/menu'
import { z } from 'zod'

// GET /api/menu/categories - Liste der Menü-Kategorien mit Filtern
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'KITCHEN', 'STAFF'])
    
    const { searchParams } = new URL(request.url)
    const includeItems = searchParams.get('includeItems') === 'true'
    const isActive = searchParams.get('isActive')
    
    const whereClause: any = {}
    
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    const categories = await db.menuCategory.findMany({
      where: whereClause,
      include: {
        menuItems: includeItems ? {
          select: {
            id: true,
            name: true,
            nameEn: true,
            price: true,
            isAvailable: true,
            isSignature: true,
            isVegetarian: true,
            isVegan: true,
            isGlutenFree: true,
            displayOrder: true
          },
          orderBy: { displayOrder: 'asc' }
        } : false,
        _count: {
          select: {
            menuItems: true
          }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorien:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Unzureichende Berechtigung' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kategorien' },
      { status: 500 }
    )
  }
}

// POST /api/menu/categories - Neue Kategorie erstellen
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = createMenuCategorySchema.parse(body)

    // Prüfe, ob Kategorie mit diesem Namen bereits existiert
    const existingCategory = await db.menuCategory.findFirst({
      where: { 
        name: validatedData.name 
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Eine Kategorie mit diesem Namen existiert bereits' },
        { status: 409 }
      )
    }

    // Erstelle neue Kategorie
    const category = await db.menuCategory.create({
      data: validatedData,
      include: {
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true
          }
        },
        _count: {
          select: {
            menuItems: true
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Kategoriedaten', details: error.issues },
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
      { error: 'Fehler beim Erstellen der Kategorie' },
      { status: 500 }
    )
  }
}

// PUT /api/menu/categories - Kategorie aktualisieren
export async function PUT(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = updateMenuCategorySchema.parse(body)

    // Prüfe, ob Kategorie existiert
    const existingCategory = await db.menuCategory.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe auf Namenskonflikte (falls Name geändert wird)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameConflict = await db.menuCategory.findFirst({
        where: { 
          name: validatedData.name,
          id: { not: validatedData.id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Eine Kategorie mit diesem Namen existiert bereits' },
          { status: 409 }
        )
      }
    }

    // Aktualisiere Kategorie
    const { id, ...updateData } = validatedData
    const updatedCategory = await db.menuCategory.update({
      where: { id },
      data: updateData,
      include: {
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true
          }
        },
        _count: {
          select: {
            menuItems: true
          }
        }
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Kategorie:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Kategoriedaten', details: error.issues },
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
      { error: 'Fehler beim Aktualisieren der Kategorie' },
      { status: 500 }
    )
  }
}

// DELETE /api/menu/categories - Kategorie löschen
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategorie-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe, ob Kategorie existiert
    const existingCategory = await db.menuCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            menuItems: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe, ob Kategorie Gerichte enthält
    if (existingCategory._count.menuItems > 0) {
      return NextResponse.json(
        { error: 'Kategorie kann nicht gelöscht werden, da sie Gerichte enthält' },
        { status: 409 }
      )
    }

    // Lösche Kategorie
    await db.menuCategory.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ message: 'Kategorie erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen der Kategorie:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Unzureichende Berechtigung' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kategorie' },
      { status: 500 }
    )
  }
}