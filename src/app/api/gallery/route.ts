import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { galleryFilterSchema } from '@/lib/validations/gallery'
import { z } from 'zod'

// GET /api/gallery - Get gallery images with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    }

    // Remove undefined and null values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
    )

    // Validate filters
    const validatedFilters = galleryFilterSchema.parse(cleanFilters)

    // Build where clause
    const whereClause: any = {
      isActive: validatedFilters.isActive ?? true, // Default to active images only
    }

    if (validatedFilters.category) {
      whereClause.category = validatedFilters.category
    }

    if (validatedFilters.search) {
      whereClause.OR = [
        { title: { contains: validatedFilters.search, mode: 'insensitive' } },
        { titleEn: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
        { descriptionEn: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    // Simplified query to avoid prepared statement conflicts in serverless
    const images = await db.galleryImage.findMany({
      where: whereClause,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: validatedFilters.limit,
      skip: validatedFilters.offset,
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        category: true,
        displayOrder: true,
        createdAt: true,
      }
    })

    // Simplified count query
    const totalCount = await db.galleryImage.count({ where: whereClause })

    // Simple category distribution (avoid groupBy for now)
    const categoryDistribution: Record<string, number> = {}
    if (images.length > 0) {
      images.forEach(image => {
        categoryDistribution[image.category] = (categoryDistribution[image.category] || 0) + 1
      })
    }

    // Format response
    const response = {
      images,
      pagination: {
        total: totalCount,
        offset: validatedFilters.offset,
        limit: validatedFilters.limit,
        hasMore: validatedFilters.offset + validatedFilters.limit < totalCount
      },
      categories: categoryDistribution,
      filters: validatedFilters
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid gallery filters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    )
  }
}

// POST /api/gallery - Create new gallery image (admin only)
export async function POST(request: NextRequest) {
  try {
    // Note: In a full implementation, this would require admin authentication
    // For now, we'll implement the structure for future admin functionality
    
    return NextResponse.json(
      { error: 'Gallery image creation requires admin authentication' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Error creating gallery image:', error)
    
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    )
  }
}