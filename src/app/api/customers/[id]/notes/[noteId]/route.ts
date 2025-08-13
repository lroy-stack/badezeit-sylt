import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const updateNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
  isImportant: z.boolean().default(false),
})

interface RouteParams {
  params: Promise<{
    id: string
    noteId: string
  }>
}

// GET /api/customers/[id]/notes/[noteId] - Get specific note (Staff+ only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
    const resolvedParams = await params
    
    const note = await db.customerNote.findUnique({
      where: { 
        id: resolvedParams.noteId,
        customerId: resolvedParams.id 
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

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id]/notes/[noteId] - Update note (Admin/Manager only)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])
    const resolvedParams = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = updateNoteSchema.parse(body)

    // Check if note exists and belongs to the customer
    const existingNote = await db.customerNote.findUnique({
      where: { 
        id: resolvedParams.noteId,
        customerId: resolvedParams.id 
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Update note
    const updatedNote = await db.customerNote.update({
      where: { id: resolvedParams.noteId },
      data: {
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

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Error updating note:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid note data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id]/notes/[noteId] - Delete note (Admin/Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    const resolvedParams = await params
    
    // Check if note exists and belongs to the customer
    const note = await db.customerNote.findUnique({
      where: { 
        id: resolvedParams.noteId,
        customerId: resolvedParams.id 
      }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Delete note
    await db.customerNote.delete({
      where: { id: resolvedParams.noteId }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}