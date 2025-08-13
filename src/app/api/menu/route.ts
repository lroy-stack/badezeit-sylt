import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { menuFilterSchema } from '@/lib/validations/menu'
import { z } from 'zod'

// GET /api/menu - Get public menu with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
      isAvailable: searchParams.get('isAvailable') === 'true' ? true : undefined,
      isSignature: searchParams.get('isSignature') === 'true' ? true : undefined,
      isVegetarian: searchParams.get('isVegetarian') === 'true' ? true : undefined,
      isVegan: searchParams.get('isVegan') === 'true' ? true : undefined,
      isGlutenFree: searchParams.get('isGlutenFree') === 'true' ? true : undefined,
      priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      
      // Allergen exclusions
      excludeGluten: searchParams.get('excludeGluten') === 'true' ? true : undefined,
      excludeMilk: searchParams.get('excludeMilk') === 'true' ? true : undefined,
      excludeEggs: searchParams.get('excludeEggs') === 'true' ? true : undefined,
      excludeNuts: searchParams.get('excludeNuts') === 'true' ? true : undefined,
      excludeFish: searchParams.get('excludeFish') === 'true' ? true : undefined,
      excludeShellfish: searchParams.get('excludeShellfish') === 'true' ? true : undefined,
      excludeSoy: searchParams.get('excludeSoy') === 'true' ? true : undefined,
      excludeCelery: searchParams.get('excludeCelery') === 'true' ? true : undefined,
      excludeMustard: searchParams.get('excludeMustard') === 'true' ? true : undefined,
      excludeSesame: searchParams.get('excludeSesame') === 'true' ? true : undefined,
      excludeSulfites: searchParams.get('excludeSulfites') === 'true' ? true : undefined,
      excludeLupin: searchParams.get('excludeLupin') === 'true' ? true : undefined,
      excludeMollusks: searchParams.get('excludeMollusks') === 'true' ? true : undefined,
      excludePeanuts: searchParams.get('excludePeanuts') === 'true' ? true : undefined,
    }

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )

    // Validate filters
    const validatedFilters = menuFilterSchema.parse(cleanFilters)

    // Build where clause for menu items
    const whereClause: any = {
      isAvailable: validatedFilters.isAvailable ?? true, // Default to available items
    }

    if (validatedFilters.categoryId) {
      whereClause.categoryId = validatedFilters.categoryId
    }

    if (validatedFilters.search) {
      whereClause.OR = [
        { name: { contains: validatedFilters.search, mode: 'insensitive' } },
        { nameEn: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
        { descriptionEn: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    if (validatedFilters.isSignature) {
      whereClause.isSignature = true
    }

    if (validatedFilters.isVegetarian) {
      whereClause.isVegetarian = true
    }

    if (validatedFilters.isVegan) {
      whereClause.isVegan = true
    }

    if (validatedFilters.isGlutenFree) {
      whereClause.isGlutenFree = true
    }

    if (validatedFilters.priceMin !== undefined || validatedFilters.priceMax !== undefined) {
      whereClause.price = {}
      if (validatedFilters.priceMin !== undefined) {
        whereClause.price.gte = validatedFilters.priceMin
      }
      if (validatedFilters.priceMax !== undefined) {
        whereClause.price.lte = validatedFilters.priceMax
      }
    }

    // Handle allergen exclusions
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

    // Simplified query to avoid prepared statement conflicts
    // First get categories
    const categories = await db.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })

    // Then get menu items separately to avoid complex joins
    const allMenuItems = await db.menuItem.findMany({
      where: whereClause,
      orderBy: [
        { isSignature: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        categoryId: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        price: true,
        isSignature: true,
        isNew: true,
        isSeasonalSpecial: true,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isLactoseFree: true,
        // Allergen information
        containsGluten: true,
        containsMilk: true,
        containsEggs: true,
        containsNuts: true,
        containsFish: true,
        containsShellfish: true,
        containsSoy: true,
        containsCelery: true,
        containsMustard: true,
        containsSesame: true,
        containsSulfites: true,
        containsLupin: true,
        containsMollusks: true,
        containsPeanuts: true,
        images: true,
        displayOrder: true,
      }
    })

    // Combine categories with their menu items
    const categoriesWithItems = categories.map(category => ({
      ...category,
      menuItems: allMenuItems.filter(item => item.categoryId === category.id)
    }))

    // Filter out empty categories if no items match the filter  
    const finalCategories = categoriesWithItems.filter(category => category.menuItems.length > 0)

    // Get summary statistics from final categories
    const totalItems = finalCategories.reduce((sum, category) => sum + category.menuItems.length, 0)
    const signatureItems = finalCategories.reduce((sum, category) => 
      sum + category.menuItems.filter(item => item.isSignature).length, 0
    )
    const vegetarianItems = finalCategories.reduce((sum, category) => 
      sum + category.menuItems.filter(item => item.isVegetarian).length, 0
    )
    const veganItems = finalCategories.reduce((sum, category) => 
      sum + category.menuItems.filter(item => item.isVegan).length, 0
    )
    
    const prices = finalCategories.flatMap(category => 
      category.menuItems.map(item => Number(item.price))
    )
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    } : null

    return NextResponse.json({
      categories: finalCategories,
      summary: {
        totalItems,
        signatureItems,
        vegetarianItems,
        veganItems,
        priceRange,
      },
      filters: validatedFilters,
    })
  } catch (error) {
    console.error('Error fetching menu:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid menu filters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}