import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createReservationSchema, reservationFilterSchema } from '@/lib/validations/reservation'
import { sendReservationConfirmation } from '@/lib/email/send-email'
import { z } from 'zod'

// GET /api/reservations - List reservations with filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      status: searchParams.get('status'),
      customerId: searchParams.get('customerId'),
      tableId: searchParams.get('tableId'),
    }

    // Validate filters
    const validatedFilters = reservationFilterSchema.parse(
      Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null))
    )

    const whereClause: any = {}
    
    if (validatedFilters.startDate && validatedFilters.endDate) {
      whereClause.dateTime = {
        gte: validatedFilters.startDate,
        lte: validatedFilters.endDate,
      }
    } else if (validatedFilters.startDate) {
      whereClause.dateTime = {
        gte: validatedFilters.startDate,
      }
    }

    if (validatedFilters.status) {
      whereClause.status = validatedFilters.status
    }

    if (validatedFilters.customerId) {
      whereClause.customerId = validatedFilters.customerId
    }

    if (validatedFilters.tableId) {
      whereClause.tableId = validatedFilters.tableId
    }

    const reservations = await db.reservation.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            language: true,
          }
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            location: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        dateTime: 'asc',
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    
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
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    
    // Validate request data
    const validatedData = createReservationSchema.parse(body)

    // Check if customer already exists or create new one
    let customer
    if (validatedData.customerId) {
      customer = await db.customer.findUnique({
        where: { id: validatedData.customerId }
      })
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
    } else {
      // Check if customer with email exists
      const existingCustomer = await db.customer.findUnique({
        where: { email: validatedData.email }
      })

      if (existingCustomer) {
        customer = existingCustomer
      } else {
        // Create new customer
        customer = await db.customer.create({
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            language: 'DE', // Default to German
            emailConsent: validatedData.emailConsent,
            marketingConsent: validatedData.marketingConsent,
            dataProcessingConsent: validatedData.dataProcessingConsent,
            consentDate: new Date(),
          }
        })
      }
    }

    // Check table availability if specific table requested
    if (validatedData.tableId) {
      const conflictingReservation = await db.reservation.findFirst({
        where: {
          tableId: validatedData.tableId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED']
          },
          dateTime: {
            gte: new Date(validatedData.dateTime.getTime() - validatedData.duration * 60 * 1000),
            lte: new Date(validatedData.dateTime.getTime() + validatedData.duration * 60 * 1000),
          }
        }
      })

      if (conflictingReservation) {
        return NextResponse.json(
          { error: 'Table is not available at the requested time' },
          { status: 409 }
        )
      }
    }

    // Create reservation
    const reservation = await db.reservation.create({
      data: {
        customerId: customer.id,
        tableId: validatedData.tableId,
        dateTime: validatedData.dateTime,
        partySize: validatedData.partySize,
        duration: validatedData.duration,
        specialRequests: validatedData.specialRequests,
        occasion: validatedData.occasion,
        dietaryNotes: validatedData.dietaryNotes,
        status: 'PENDING',
        source: 'WEBSITE',
        createdById: user?.id || customer.id, // If no authenticated user, use customer ID
      },
      include: {
        customer: true,
        table: true,
      }
    })

    // Send confirmation email if customer consents
    if (customer.emailConsent) {
      try {
        await sendReservationConfirmation(customer.email, {
          customerName: `${customer.firstName} ${customer.lastName}`,
          dateTime: reservation.dateTime,
          partySize: reservation.partySize,
          tableNumber: reservation.table?.number,
          specialRequests: reservation.specialRequests || undefined,
          restaurantPhone: '+49 4651 123456',
          restaurantEmail: 'reservierung@badezeit-sylt.de',
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the reservation if email fails
      }
    }

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid reservation data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}