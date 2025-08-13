import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createCustomerSchema, customerFilterSchema } from '@/lib/validations/customer'
import { z } from 'zod'

// GET /api/customers - List customers with filters (Staff+ only)
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search'),
      language: searchParams.get('language') as 'DE' | 'EN' | null,
      isVip: searchParams.get('isVip') === 'true' ? true : searchParams.get('isVip') === 'false' ? false : undefined,
      hasRecentVisit: searchParams.get('hasRecentVisit') === 'true' ? true : undefined,
      preferredLocation: searchParams.get('preferredLocation') as any,
      minVisits: searchParams.get('minVisits') ? parseInt(searchParams.get('minVisits')!) : undefined,
      minSpent: searchParams.get('minSpent') ? parseFloat(searchParams.get('minSpent')!) : undefined,
    }

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )

    // Validate filters
    const validatedFilters = customerFilterSchema.parse(cleanFilters)

    // Build where clause
    const whereClause: any = {}

    if (validatedFilters.search) {
      whereClause.OR = [
        { firstName: { contains: validatedFilters.search, mode: 'insensitive' } },
        { lastName: { contains: validatedFilters.search, mode: 'insensitive' } },
        { email: { contains: validatedFilters.search, mode: 'insensitive' } },
        { phone: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    if (validatedFilters.language) {
      whereClause.language = validatedFilters.language
    }

    if (validatedFilters.isVip !== undefined) {
      whereClause.isVip = validatedFilters.isVip
    }

    if (validatedFilters.preferredLocation) {
      whereClause.preferredLocation = validatedFilters.preferredLocation
    }

    if (validatedFilters.minVisits !== undefined) {
      whereClause.totalVisits = { gte: validatedFilters.minVisits }
    }

    if (validatedFilters.minSpent !== undefined) {
      whereClause.totalSpent = { gte: validatedFilters.minSpent }
    }

    if (validatedFilters.hasRecentVisit) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      whereClause.lastVisit = { gte: thirtyDaysAgo }
    }

    const customers = await db.customer.findMany({
      where: whereClause,
      include: {
        reservations: {
          select: {
            id: true,
            dateTime: true,
            partySize: true,
            status: true,
          },
          orderBy: {
            dateTime: 'desc',
          },
          take: 5, // Last 5 reservations
        },
        notes: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Last 3 notes
        },
        _count: {
          select: {
            reservations: true,
          }
        }
      },
      orderBy: [
        { isVip: 'desc' },
        { totalSpent: 'desc' },
        { lastVisit: 'desc' },
      ],
      take: 50, // Limit results
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filters', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = createCustomerSchema.parse(body)

    // Check if customer with email already exists
    const existingCustomer = await db.customer.findUnique({
      where: { email: validatedData.email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create new customer
    const customer = await db.customer.create({
      data: {
        ...validatedData,
        consentDate: validatedData.dataProcessingConsent ? new Date() : null,
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}