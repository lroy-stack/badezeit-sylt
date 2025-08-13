import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
  isImportant: z.boolean().default(false),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/customers/[id]/notes - Get all notes for customer (Staff+ only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAuth()
    const resolvedParams = await params
    
    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const notes = await db.customerNote.findMany({
      where: { customerId: resolvedParams.id },
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
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching customer notes:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch customer notes' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[id]/notes - Create new note (Staff+ only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = createNoteSchema.parse(body)

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Create new note
    const note = await db.customerNote.create({
      data: {
        customerId: resolvedParams.id,
        userId: user.id,
        note: validatedData.note,
        isImportant: validatedData.isImportant,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating customer note:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid note data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to create customer note' },
      { status: 500 }
    )
  }
}