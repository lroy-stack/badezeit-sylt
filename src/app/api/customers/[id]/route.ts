import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const updateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().transform(val => val ? new Date(val) : null).optional(),
  language: z.enum(['DE', 'EN']).optional(),
  preferredTime: z.string().nullable().optional(),
  preferredLocation: z.enum(['TERRACE', 'INDOOR', 'BAR', 'PRIVATE']).nullable().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.string().nullable().optional(),
  favoriteDisheIds: z.array(z.string()).optional(),
  isVip: z.boolean().optional(),
  dataProcessingConsent: z.boolean().optional(),
  emailConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/customers/[id] - Get customer by ID (Staff+ only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        reservations: {
          include: {
            table: {
              select: {
                id: true,
                number: true,
                capacity: true,
                location: true
              }
            }
          },
          orderBy: {
            dateTime: 'desc'
          }
        },
        notes: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                role: true
              }
            }
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

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id] - Update customer (Staff+ only)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = updateCustomerSchema.parse(body)

    // Check if customer exists
    const existingCustomer = await db.customer.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // If email is being updated, check if it's already in use
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const emailInUse = await db.customer.findUnique({
        where: { email: validatedData.email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Email already in use by another customer' },
          { status: 409 }
        )
      }
    }

    // Update consent date if any consent is being modified
    const consentFields = ['dataProcessingConsent', 'emailConsent', 'marketingConsent']
    const isConsentUpdate = consentFields.some(field => field in validatedData)
    
    const updateData: any = { ...validatedData }
    if (isConsentUpdate) {
      updateData.consentDate = new Date()
    }

    // Update customer
    const updatedCustomer = await db.customer.update({
      where: { id: resolvedParams.id },
      data: updateData,
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
          take: 5,
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
          take: 3,
        },
        _count: {
          select: {
            reservations: true,
          }
        }
      }
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer (Admin/Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    const resolvedParams = await params
    
    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        reservations: {
          select: { id: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if customer has any reservations
    if (customer.reservations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing reservations', 
          message: 'Please cancel or remove all reservations first' 
        },
        { status: 409 }
      )
    }

    // Delete customer (this will cascade to notes due to foreign key)
    await db.customer.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}