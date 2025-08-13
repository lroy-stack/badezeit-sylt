import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { createMenuItemSchema, updateMenuItemSchema, menuFilterSchema } from '@/lib/validations/menu'
import { z } from 'zod'

// GET /api/menu/items - Liste der Menü-Gerichte mit erweiterten Filtern
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'KITCHEN', 'STAFF'])
    
    const { searchParams } = new URL(request.url)
    const filters = {
      categoryId: searchParams.get('categoryId'),
      search: searchParams.get('search'),
      isAvailable: searchParams.get('isAvailable') === 'true' ? true : searchParams.get('isAvailable') === 'false' ? false : undefined,
      isSignature: searchParams.get('isSignature') === 'true' ? true : undefined,
      isVegetarian: searchParams.get('isVegetarian') === 'true' ? true : undefined,
      isVegan: searchParams.get('isVegan') === 'true' ? true : undefined,
      isGlutenFree: searchParams.get('isGlutenFree') === 'true' ? true : undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      
      // Allergen-Ausschlüsse
      excludeGluten: searchParams.get('excludeGluten') === 'true',
      excludeMilk: searchParams.get('excludeMilk') === 'true',
      excludeEggs: searchParams.get('excludeEggs') === 'true',
      excludeNuts: searchParams.get('excludeNuts') === 'true',
      excludeFish: searchParams.get('excludeFish') === 'true',
      excludeShellfish: searchParams.get('excludeShellfish') === 'true',
      excludeSoy: searchParams.get('excludeSoy') === 'true',
      excludeCelery: searchParams.get('excludeCelery') === 'true',
      excludeMustard: searchParams.get('excludeMustard') === 'true',
      excludeSesame: searchParams.get('excludeSesame') === 'true',
      excludeSulfites: searchParams.get('excludeSulfites') === 'true',
      excludeLupin: searchParams.get('excludeLupin') === 'true',
      excludeMollusks: searchParams.get('excludeMollusks') === 'true',
      excludePeanuts: searchParams.get('excludePeanuts') === 'true',
    }

    // Entferne undefined Werte
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )

    // Validiere Filter
    const validatedFilters = menuFilterSchema.parse(cleanFilters)

    // Erstelle WHERE Clause
    const whereClause: any = {}

    if (validatedFilters.categoryId) {
      whereClause.categoryId = validatedFilters.categoryId
    }

    if (validatedFilters.search) {
      whereClause.OR = [
        { name: { contains: validatedFilters.search, mode: 'insensitive' } },
        { nameEn: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } }
      ]
    }

    if (validatedFilters.isAvailable !== undefined) {
      whereClause.isAvailable = validatedFilters.isAvailable
    }

    if (validatedFilters.isSignature) {
      whereClause.isSignature = validatedFilters.isSignature
    }

    if (validatedFilters.isVegetarian) {
      whereClause.isVegetarian = validatedFilters.isVegetarian
    }

    if (validatedFilters.isVegan) {
      whereClause.isVegan = validatedFilters.isVegan
    }

    if (validatedFilters.isGlutenFree) {
      whereClause.isGlutenFree = validatedFilters.isGlutenFree
    }

    // Preis-Filter
    if (validatedFilters.priceMin !== undefined || validatedFilters.priceMax !== undefined) {
      whereClause.price = {}
      if (validatedFilters.priceMin !== undefined) {
        whereClause.price.gte = validatedFilters.priceMin
      }
      if (validatedFilters.priceMax !== undefined) {
        whereClause.price.lte = validatedFilters.priceMax
      }
    }

    // Allergen-Ausschlüsse
    if (validatedFilters.excludeGluten) {
      whereClause.containsGluten = false
    }
    if (validatedFilters.excludeMilk) {
      whereClause.containsMilk = false
    }
    if (validatedFilters.excludeEggs) {
      whereClause.containsEggs = false
    }
    if (validatedFilters.excludeNuts) {
      whereClause.containsNuts = false
    }
    if (validatedFilters.excludeFish) {
      whereClause.containsFish = false
    }
    if (validatedFilters.excludeShellfish) {
      whereClause.containsShellfish = false
    }
    if (validatedFilters.excludeSoy) {
      whereClause.containsSoy = false
    }
    if (validatedFilters.excludeCelery) {
      whereClause.containsCelery = false
    }
    if (validatedFilters.excludeMustard) {
      whereClause.containsMustard = false
    }
    if (validatedFilters.excludeSesame) {
      whereClause.containsSesame = false
    }
    if (validatedFilters.excludeSulfites) {
      whereClause.containsSulfites = false
    }
    if (validatedFilters.excludeLupin) {
      whereClause.containsLupin = false
    }
    if (validatedFilters.excludeMollusks) {
      whereClause.containsMollusks = false
    }
    if (validatedFilters.excludePeanuts) {
      whereClause.containsPeanuts = false
    }

    const items = await db.menuItem.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' }
      ]
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Fehler beim Abrufen der Gerichte:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Filter', details: error.issues },
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
      { error: 'Fehler beim Abrufen der Gerichte' },
      { status: 500 }
    )
  }
}

// POST /api/menu/items - Neues Gericht erstellen
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER', 'KITCHEN'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = createMenuItemSchema.parse(body)

    // Prüfe, ob Kategorie existiert
    const category = await db.menuCategory.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe, ob Gericht mit diesem Namen in der Kategorie bereits existiert
    const existingItem = await db.menuItem.findFirst({
      where: { 
        name: validatedData.name,
        categoryId: validatedData.categoryId
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Ein Gericht mit diesem Namen existiert bereits in dieser Kategorie' },
        { status: 409 }
      )
    }

    // Erstelle neues Gericht
    const item = await db.menuItem.create({
      data: {
        ...validatedData,
        createdById: user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Gerichts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Gerichtdaten', details: error.issues },
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
      { error: 'Fehler beim Erstellen des Gerichts' },
      { status: 500 }
    )
  }
}

// PUT /api/menu/items - Gericht aktualisieren
export async function PUT(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'KITCHEN'])
    
    const body = await request.json()
    
    // Validiere Request-Daten
    const validatedData = updateMenuItemSchema.parse(body)

    // Prüfe, ob Gericht existiert
    const existingItem = await db.menuItem.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gericht nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe Kategorie falls geändert
    if (validatedData.categoryId && validatedData.categoryId !== existingItem.categoryId) {
      const category = await db.menuCategory.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Kategorie nicht gefunden' },
          { status: 404 }
        )
      }
    }

    // Prüfe auf Namenskonflikte
    if (validatedData.name && validatedData.name !== existingItem.name) {
      const nameConflict = await db.menuItem.findFirst({
        where: { 
          name: validatedData.name,
          categoryId: validatedData.categoryId || existingItem.categoryId,
          id: { not: validatedData.id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Ein Gericht mit diesem Namen existiert bereits in dieser Kategorie' },
          { status: 409 }
        )
      }
    }

    // Aktualisiere Gericht
    const { id, ...updateData } = validatedData
    const updatedItem = await db.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Gerichts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Gerichtdaten', details: error.issues },
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
      { error: 'Fehler beim Aktualisieren des Gerichts' },
      { status: 500 }
    )
  }
}

// DELETE /api/menu/items - Gericht löschen
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Gericht-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe, ob Gericht existiert
    const existingItem = await db.menuItem.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gericht nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche Gericht
    await db.menuItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ message: 'Gericht erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen des Gerichts:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Unzureichende Berechtigung' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Fehler beim Löschen des Gerichts' },
      { status: 500 }
    )
  }
}