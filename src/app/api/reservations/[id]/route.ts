import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { updateReservationSchema } from '@/lib/validations/reservation'
import { sendReservationCancellation } from '@/lib/email/send-email'
import { z } from 'zod'

// GET /api/reservations/[id] - Get single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
    const reservation = await db.reservation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            language: true,
            preferredLocation: true,
            dietaryRestrictions: true,
            allergies: true,
          }
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            location: true,
            description: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

// PATCH /api/reservations/[id] - Update reservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = updateReservationSchema.parse({
      ...body,
      id: resolvedParams.id
    })

    // Check if reservation exists
    const existingReservation = await db.reservation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customer: true,
        table: true,
      }
    })

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check table availability if table is being changed
    if (validatedData.tableId && validatedData.tableId !== existingReservation.tableId) {
      const dateTime = validatedData.dateTime || existingReservation.dateTime
      const duration = validatedData.duration || existingReservation.duration

      const conflictingReservation = await db.reservation.findFirst({
        where: {
          tableId: validatedData.tableId,
          id: { not: resolvedParams.id }, // Exclude current reservation
          status: {
            in: ['PENDING', 'CONFIRMED', 'SEATED']
          },
          dateTime: {
            gte: new Date(dateTime.getTime() - duration * 60 * 1000),
            lte: new Date(dateTime.getTime() + duration * 60 * 1000),
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

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedById: user.id,
    }

    // Set completion timestamp when status changes to COMPLETED
    if (validatedData.status === 'COMPLETED' && existingReservation.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    // Set cancellation timestamp when status changes to CANCELLED
    if (validatedData.status === 'CANCELLED' && existingReservation.status !== 'CANCELLED') {
      updateData.cancelledAt = new Date()
    }

    // Update reservation
    const updatedReservation = await db.reservation.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        customer: true,
        table: true,
      }
    })

    // Send cancellation email if status changed to cancelled
    if (validatedData.status === 'CANCELLED' && 
        existingReservation.status !== 'CANCELLED' &&
        existingReservation.customer.emailConsent) {
      try {
        await sendReservationCancellation(existingReservation.customer.email, {
          customerName: `${existingReservation.customer.firstName} ${existingReservation.customer.lastName}`,
          dateTime: existingReservation.dateTime,
          cancellationReason: validatedData.cancellationReason,
          rebookingLink: `${process.env.NEXT_PUBLIC_APP_URL}/reservierung`,
        })
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error('Error updating reservation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

// DELETE /api/reservations/[id] - Cancel reservation (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    const resolvedParams = await params
    
    // Check if reservation exists
    const existingReservation = await db.reservation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customer: true,
      }
    })

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (existingReservation.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Reservation is already cancelled' },
        { status: 400 }
      )
    }

    // Update reservation status to cancelled
    const cancelledReservation = await db.reservation.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Cancelled by staff',
        updatedById: user.id,
      },
      include: {
        customer: true,
      }
    })

    // Send cancellation email
    if (existingReservation.customer.emailConsent) {
      try {
        await sendReservationCancellation(existingReservation.customer.email, {
          customerName: `${existingReservation.customer.firstName} ${existingReservation.customer.lastName}`,
          dateTime: existingReservation.dateTime,
          cancellationReason: 'Cancelled by restaurant',
          rebookingLink: `${process.env.NEXT_PUBLIC_APP_URL}/reservierung`,
        })
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError)
        // Don't fail the cancellation if email fails
      }
    }

    return NextResponse.json(cancelledReservation)
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}